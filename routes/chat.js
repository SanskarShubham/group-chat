const express = require('express');
const chatController = require('../controllers/chat');
const router = express.Router();
const userAuth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });
router.get('/chats', userAuth.authorization, chatController.getChats);

// /api/add-chat => POST
router.get('/edit-chat/:chatid', chatController.getEditChat);
router.post('/add-chat', [userAuth.authorization, upload.single('file')], chatController.postAddChat);

// router.get('/edit-chat/:chatId', chatController.getEditChat);

router.post('/edit-chat/', userAuth.authorization, chatController.postEditChat);
router.delete('/delete-chat/:chatid', userAuth.authorization, chatController.postDeleteChat);

module.exports = router;
