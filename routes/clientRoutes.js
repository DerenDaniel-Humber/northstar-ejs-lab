const router = require('express').Router();
const controller = require('../controllers/clientController');
router.get('/', controller.home);
router.get('/clients', controller.list);
router.get('/clients/:id', controller.details);
module.exports = router;
