const cron = require('node-cron');
const  Chat  = require('../models/chat'); // Import your Sequelize models
const  ChatArchive  = require('../models/chat-archive'); // Import your Sequelize models
const  Sequelize  = require('sequelize');

cron.schedule('0 0 * * *', async () => {
  // Get messages older than one day
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const oldMessages = await Chat.findAll({
    where: {
      createdAt: {
        [Sequelize.Op.lt]: oneDayAgo
      }
    }
  });

  // Move old messages to ChatArchive
  for (const message of oldMessages) {
    await ChatArchive.create({
        message: message.message,
        type: message.type,
        fileName: message.fileName,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    });
    // Optionally, delete the message from the original table
    await message.destroy();
  }
});