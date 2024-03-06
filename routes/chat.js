const express = require('express');
const chatController = require('../controllers/chat');
const router = express.Router();
const userAuth = require('../middleware/auth');

 router.get('/chats',userAuth.authorization, chatController.getChats);

// /api/add-chat => POST
router.get('/edit-chat/:chatid', chatController.getEditChat);
router.post('/add-chat',userAuth.authorization, chatController.postAddChat);

// router.get('/edit-chat/:chatId', chatController.getEditChat);

router.post('/edit-chat/',userAuth.authorization, chatController.postEditChat);
router.delete('/delete-chat/:chatid',userAuth.authorization, chatController.postDeleteChat);

module.exports = router;
