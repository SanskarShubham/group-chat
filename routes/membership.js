const express = require('express');

 const order = require('../controllers/membership'); 
 const premium = require('../controllers/premium'); 
 const userAuth = require('../middleware/auth');
 const router = express.Router();

 router.post('/update-order',userAuth.authorization,order.postUpdateOrder);
 router.post('/create-order',userAuth.authorization,order.postCreateOrder);
 router.post('/update-failed-order',userAuth.authorization,order.postUpdateFailedOrder);


 router.get('/premium/get-leaderboard',userAuth.authorization,premium.getLeaderboard);
 router.get('/premium/download-report',userAuth.authorization,premium.getDownloadReport);
// router.post('/login',user.postLogin)


module.exports = router;