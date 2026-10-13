const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../app');
let server, base;
before(async () => {server = app.listen(0); await new Promise(resolve => server.once('listening', resolve)); base = `http://127.0.0.1:${server.address().port}`;});
after(() => new Promise(resolve => server.close(resolve)));
test('pages share layout, navigation, footer and local Bootstrap', async () => {
 for (const route of ['/', '/clients', '/clients/NS-001']) {
  const response = await fetch(base + route); assert.equal(response.status, 200);
  const html = await response.text();
  for (const value of ['brand-header', 'aria-label="Main navigation"', '<footer', '/vendor/bootstrap/bootstrap.min.css']) assert.ok(html.includes(value));
 }
 assert.equal((await fetch(base+'/vendor/bootstrap/bootstrap.min.css')).status,200);
});
test('directory renders dataset and links to risk-labelled profiles', async () => {
 const data = JSON.parse(await fs.readFile(path.join(__dirname,'../data/clients.json'),'utf8'));
 const html = await (await fetch(base+'/clients')).text();
 for (const client of data) {
  assert.ok(html.includes(client.name)); assert.ok(html.includes('/clients/'+client.id));
  const detail = await (await fetch(base+'/clients/'+client.id)).text();
  assert.ok(detail.includes(client.riskCategory+' risk')); assert.ok(detail.includes(client.email));
 }
});
test('dataset updates appear on next request and HTML is escaped', async () => {
 const filename = path.join(__dirname,'../data/clients.json'); const original = await fs.readFile(filename,'utf8');
 try {
  const data = JSON.parse(original); data[0].name = 'Changed <script>alert(1)</script>';
  await fs.writeFile(filename, JSON.stringify(data));
  for (const route of ['/clients','/clients/NS-001']) {
   const html = await (await fetch(base+route)).text();
   assert.ok(html.includes('Changed &lt;script&gt;')); assert.ok(!html.includes('<script>alert(1)</script>'));
  }
 } finally {await fs.writeFile(filename,original);}
});
test('missing clients and routes return 404; malformed data returns 500', async () => {
 for (const route of ['/clients/unknown','/missing']) assert.equal((await fetch(base+route)).status,404);
 const filename=path.join(__dirname,'../data/clients.json'); const original=await fs.readFile(filename,'utf8');
 try {await fs.writeFile(filename,'invalid JSON'); assert.equal((await fetch(base+'/clients')).status,500);}
 finally {await fs.writeFile(filename,original);}
});
