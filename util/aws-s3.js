const fs = require('fs');
const AWS = require('aws-sdk');
const awsS3 = (file) => {
    return new Promise((resolve, reject) => {
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        const s3 = new AWS.S3({
            accessKeyId,
            secretAccessKey,
            // region
        });


        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `chat/${Date.now()}_${file.originalname}`, // filename in S3 bucket
            Body: fs.readFileSync(file.path),
            ACL: 'public-read'
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                reject(err);
            } else {
                console.log('File uploaded successfully:', data.Location);
                resolve(data);
            }
        });
      
    });
 
}

module.exports = awsS3