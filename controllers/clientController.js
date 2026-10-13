const fs = require('node:fs/promises');
const path = require('node:path');
// Read on every request so JSON changes appear without a server restart.
async function loadClients() {
  const clients = JSON.parse(await fs.readFile(path.join(__dirname, '../data/clients.json'), 'utf8'));
  if (!Array.isArray(clients)) throw new Error('Client dataset must be an array');
  return clients;
}
exports.home = async (req, res, next) => {
  try {
    const clients = await loadClients();
    res.render('pages/home', {title: 'Operations overview', total: clients.length, corporate: clients.filter(c => c.classification === 'Corporate').length, highRisk: clients.filter(c => c.riskCategory === 'High').length, assets: clients.reduce((sum, c) => sum + c.assetsUnderAdvice, 0)});
  } catch (error) { next(error); }
};
exports.list = async (req, res, next) => {
  try { res.render('pages/clients', {title: 'Client directory', clients: await loadClients()}); }
  catch (error) { next(error); }
};
exports.details = async (req, res, next) => {
  try {
    const client = (await loadClients()).find(c => c.id === req.params.id);
    if (!client) return res.status(404).render('pages/error', {title: 'Client not found', message: 'No client record matches this identifier.'});
    res.render('pages/clientDetails', {title: client.name, record: client});
  } catch (error) { next(error); }
};
