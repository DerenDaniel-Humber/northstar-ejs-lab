const express = require('express');
const layouts = require('express-ejs-layouts');
const path = require('node:path');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(layouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.year = new Date().getFullYear();
  res.locals.money = value => new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD', maximumFractionDigits: 0}).format(value);
  next();
});
app.use('/', require('./routes/clientRoutes'));
app.use((req, res) => res.status(404).render('pages/error', {title: 'Page not found', message: 'The requested page does not exist.'}));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).render('pages/error', {title: 'Service unavailable', message: 'Client data could not be loaded. Please try again later.'});
});
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`NorthStar portal: http://localhost:${port}`));
}
module.exports = app;
