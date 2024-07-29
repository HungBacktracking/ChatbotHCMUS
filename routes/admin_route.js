const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/admin_controller');

router.post('/edit/chatroom', auth, adminController.editChatRoom);
router.post('/db/reset', auth, adminController.resetDatabase);
router.post('/userinfo', auth, adminController.getUserData);
router.get('/auth', auth, adminController.getAuth);
router.get('/read/chatroom', auth, adminController.readChatRoom);
router.get('/read/waitroom', auth, adminController.readWaitRoom);
router.get('/read/prompts', auth, adminController.readPrompts);
router.get('/read/stats', auth, adminController.readStats);
router.post('/broadcast', auth, adminController.sentBroadcast);
router.get('/backup', auth, adminController.createBackup);
router.post('/restore', auth, adminController.restoreBackup);
router.get('/version', adminController.getVersion);

module.exports = router;
