const express = require('express');
const groupController = require('../controllers/group');
const router = express.Router();
const userAuth = require('../middleware/auth');

 router.get('/groups',userAuth.authorization, groupController.getGroups);
 router.get('/get-users',userAuth.authorization, groupController.getUsers);
 router.get('/get-charts',userAuth.authorization, groupController.getChats);
 router.get('/get-user-groups',userAuth.authorization, groupController.getUserGroups);
 router.get('/get-new-users-for-group',userAuth.authorization, groupController.getNewUsersForGroups);

// /api/add-group => POST
router.get('/edit-group/:groupid', groupController.getEditGroup);
router.post('/add-group',userAuth.authorization, groupController.postAddGroup);
router.post('/add-new-member-in-group',userAuth.authorization, groupController.postAddMemberInGroup);

// router.get('/edit-group/:groupId', groupController.getEditGroup);

router.post('/edit-group/',userAuth.authorization, groupController.postEditGroup);
router.delete('/delete-group/:groupId',userAuth.authorization, groupController.postDeleteGroup);

module.exports = router;
