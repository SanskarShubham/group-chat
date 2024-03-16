const express = require('express');
const groupController = require('../controllers/group');
const router = express.Router();


 router.get('/groups', groupController.getGroups);
 router.get('/get-users', groupController.getUsers);
//  router.get('/get-charts', groupController.getChats);
 router.get('/get-user-groups', groupController.getUserGroups);
 router.get('/get-new-users-for-group', groupController.getNewUsersForGroups);
 router.get('/get-all-group-users', groupController.getAllGroupUsers);

// /api/add-group => POST
// router.get('/edit-group/:groupid', groupController.getEditGroup);
router.post('/add-group', groupController.postAddGroup);
router.post('/add-new-member-in-group', groupController.postAddMemberInGroup);

// router.get('/edit-group/:groupId', groupController.getEditGroup);

router.post('/edit-group/', groupController.postEditGroup);
router.delete('/delete-group/:groupId', groupController.postDeleteGroup);

module.exports = router;
