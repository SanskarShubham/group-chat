const User = require('../models/user'); // Assuming your user model file is user.model.js
const Expense = require('../models/expense');// Assuming your expense model file is expense.model.js
const sequelize = require('../util/database');
const fs = require('fs');
const AWS = require('aws-sdk');

exports.getLeaderboard = (req, res, next) => {
  // Query to get the total expense for each user along with their names
  User.findAll({
    attributes: ['id', 'name', 'totalExpense'],
    order: [[sequelize.literal('totalExpense'), 'DESC']], // Order by totalExpense in descending order
  }).then(users => {

    // users will contain an array of objects with id, name, and totalExpense properties
    res.json(users);
  }).catch(error => {
    console.error('Error:', error);
    return res.status(404).json({
      status: false,
      error: error,
    });

  });

}

// [sequelize.fn('SUM', sequelize.col('amount')), 'totalExpense']
// include: [{
//   model: Expense,
//   attributes: [],
// }],
// group: ["users.id"], // Grouping by user id

//   const uploadFile = (fileName, filePath) => {
//     const fileContent = fs.readFileSync(filePath);

//     const params = {
//         Bucket: process.env.BUCKET_NAME,
//         Key: fileName, // filename in S3 bucket
//         Body: fileContent
//     };

//     s3.upload(params, (err, data) => {
//         if (err) {
//             console.error('Error uploading file:', err);
//         } else {
//             console.log('File uploaded successfully:', data.Location);
//         }
//     });
// };




exports.getDownloadReport = async (req, res, next) => {
  // Replace with your AWS credentials and bucket details
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.BUCKET_NAME;


  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
    // region
  });

  // const fileContent = fs.readFileSync('./controllers/myfile.txt');
  const expenses = await req.user.getExpenses();
  const expenseString = JSON.stringify(expenses)

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `expense${req.user.id}/${new Date()}.txt`, // filename in S3 bucket
    Body: expenseString,
    ACL: 'public-read'
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading file:', err);
    } else {

      //  console.log('File uploaded successfully:', data.Location);
      res.status(201).json({ fileUrl: data.Location });
    }
  });

}