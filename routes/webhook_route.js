const { Router } = require('express');
const verifyXHub = require('../middleware/xhub');
const webhook_controller = require('../controllers/webhook_controller');

const router = Router();

router.get('/', webhook_controller.handleGet);
router.post('/', verifyXHub, webhook_controller.handlePost);

module.exports = router;
