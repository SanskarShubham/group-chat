const fs = require('fs');
const Chat = require('../models/chat');
const User = require('../models/user');
const sequelize = require('../util/database');
const awsS3 = require('../util/aws-s3');
const getFileTypeFromMimeType = require('../util/mimetype');
const { Op } = require('sequelize');



exports.postAddChat = async (req, res, next) => {
  let transaction;
  try {
    let { message } = req.body;
    let newChatObj = {
      userId: req.user.id
    }
    if(message) {
      newChatObj['message'] = message;
    }
    const file = req.file;
    if (file) {
      const awsResponse = await awsS3(file);
      newChatObj['fileName'] = awsResponse.Location
      newChatObj['type'] = getFileTypeFromMimeType(file.mimetype)
      console.log(file.path);
      // Delete the file from local server after successful upload to S3
      // Delete the file from local server after successful upload to S3
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file from local server:', err);
      } else {
        console.log('File deleted from local server');
      }
    });

    }


    const groupId = req.body.groupId | 0;

    transaction = await sequelize.transaction();

    if (file) {
      newChatObj.file = message
    }
    if (groupId) {
      newChatObj.groupId = groupId;
    }
    console.log(newChatObj);
    const chat = await Chat.create(newChatObj, { transaction });

    // await req.user.update({ totalChat: req.user.totalChat + amount }, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: true,
      data: chat,
    });
  } catch (err) {
    console.log(err);
    if (transaction) await transaction.rollback();
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

exports.postEditChat = async (req, res, next) => {
  let transaction;
  try {
    const { id, amount, description, category } = req.body;

    transaction = await sequelize.transaction();

    const existingChat = await Chat.findOne({ where: { id: id, userId: req.user.id } });

    await req.user.update({ totalChat: req.user.totalChat - existingChat.amount + amount }, { transaction });

    const updatedCount = await existingChat.update({ amount, description, category }, { transaction });

    await transaction.commit();

    if (updatedCount === 0) {
      throw new Error('Chat not found or you do not have permission to edit');
    }

    res.status(200).json({
      status: true,
      data: { id },
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.log(err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

exports.postDeleteChat = async (req, res, next) => {
  let transaction;
  try {
    const id = req.params.chatid;

    transaction = await sequelize.transaction();

    const chat = await Chat.findOne({ where: { id, userId: req.user.id } });

    await req.user.update({ totalChat: req.user.totalChat - chat.amount }, { transaction });

    if (!chat) {
      throw new Error('Chat not found or you do not have permission to delete');
    }

    await chat.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      status: true,
      data: { id },
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.log(err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

exports.getChats = async (req, res, next) => {
  try {
    const lastChatId = req.query.lastChatId || 0;
    const groupId = req.query.groupId || 0;
    // const ITEM_PER_PAGE = parseInt(req.query.rowPerPage || 5);
    // console.log(ITEM_PER_PAGE);
    const whereClause = {
      id: {
        [Op.gt]: lastChatId,
      },
    }
    if (groupId) {
      whereClause.groupId = groupId;
    }
    const chats = await Chat.findAll({
      include: [{
        model: User,
        attributes: ['name'] // Specify the attributes you want to retrieve from the User model
      }],
      // attributes: ['id','message','createdAt'],
      where: whereClause,
      // Specify the attributes you want to retrieve from the Chat model
    })

    // {
    //   // offset: (pageNo-1) * ITEM_PER_PAGE,
    //   // limit:ITEM_PER_PAGE,
    //   // order:[['id','ASC']]
    // }
    // const totalChatCount = await  Chat.count({where:{userId:req.user.id}})

    // Calculate total page count
    // const lastPage   = Math.ceil(totalChatCount / ITEM_PER_PAGE);
    // const hasNextPage = pageNo * ITEM_PER_PAGE < totalChatCount;
    // const nextPage = pageNo+1;
    // const hasPrevPage = pageNo > 1;     
    // const PrevPage= pageNo-1;




    res.status(200).json({
      status: true,
      chats
      //  ,lastPage,hasNextPage,nextPage,hasPrevPage,PrevPage,pageNo
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

exports.getEditChat = async (req, res, next) => {
  try {
    const chatid = req.params.chatid;
    const chat = await Chat.findByPk(chatid);
    if (!chat) {
      throw new Error('Chat not found');
    }
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};
