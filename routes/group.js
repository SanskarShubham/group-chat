const express = require('express');
const groupController = require('../controllers/group');
const router = express.Router();
const userAuth = require('../middleware/auth');

 router.get('/groups',userAuth.authorization, groupController.getGroups);
 router.get('/get-users',userAuth.authorization, groupController.getUsers);

// /api/add-group => POST
router.get('/edit-group/:groupid', groupController.getEditGroup);
router.post('/add-group',userAuth.authorization, groupController.postAddGroup);

// router.get('/edit-group/:groupId', groupController.getEditGroup);

router.post('/edit-group/',userAuth.authorization, groupController.postEditGroup);
router.delete('/delete-group/:groupid',userAuth.authorization, groupController.postDeleteGroup);

module.exports = router;
