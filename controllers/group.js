const Group = require('../models/group');
const User = require('../models/user');
const groupUser = require('../models/groupUsers');

const sequelize = require('../util/database');
const { Op, where } = require('sequelize');

exports.postAddGroup = async (req, res, next) => {
  try {
    const { groupName, userIds } = req.body;
    console.log(groupName, userIds);
    let transaction = await sequelize.transaction();

    const groupExist = await Group.findOne({ where: { name: groupName } }, { transaction });
    if (groupExist) {
      return res.status(404).json({ error: 'Group already exist' });
    }
    const group =  await req.user.createGroup({ name:groupName } , { transaction })
    const users = await User.findAll({ where: { id: userIds } }, { transaction });
    if (users.length !== userIds.length) {
      return res.status(400).json({ error: 'One or more users not found' });
    }

    await group.addUsers(users, { transaction });
    await transaction.commit();
    return res.status(200).json({ group,  message: 'Users added to group successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }

};

exports.postEditGroup = async (req, res, next) => {
  let transaction;
  try {
    const { id, amount, description, category } = req.body;

    transaction = await sequelize.transaction();

    const existingGroup = await Group.findOne({ where: { id: id, userId: req.user.id } });

    await req.user.update({ totalGroup: req.user.totalGroup - existingGroup.amount + amount }, { transaction });

    const updatedCount = await existingGroup.update({ amount, description, category }, { transaction });

    await transaction.commit();

    if (updatedCount === 0) {
      throw new Error('Group not found or you do not have permission to edit');
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

exports.postDeleteGroup = async (req, res, next) => {
  let transaction;
  try {
    const id = req.params.groupid;

    transaction = await sequelize.transaction();

    const group = await Group.findOne({ where: { id, userId: req.user.id } });

    await req.user.update({ totalGroup: req.user.totalGroup - group.amount }, { transaction });

    if (!group) {
      throw new Error('Group not found or you do not have permission to delete');
    }

    await group.destroy({ transaction });

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

exports.getGroups = async (req, res, next) => {
  try {

    const UsersGpIdsobj = await groupUser.findAll(
      {
        attributes:['groupId'],
        where:{
          userId:req.user.id
        }
      })
      const groupIdsArr = UsersGpIdsobj.map(user=> user.groupId);
      console.log(groupIdsArr);
     
  // Access the groups associated with the user
    const groups = await Group.findAll({
      where:{id: groupIdsArr}
    });
    res.status(200).json({
      status: true,
      groups
  
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};
exports.getUsers = async (req, res, next) => {
  try {

    const users = await User.findAll({
      attributes: ['id', 'name'],
    })

    res.status(200).json({
      status: true,
      users
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

exports.getEditGroup = async (req, res, next) => {
  try {
    const groupid = req.params.groupid;
    const group = await Group.findByPk(groupid);
    if (!group) {
      throw new Error('Group not found');
    }
    res.status(200).json(group);
  } catch (err) {
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

    if(groupId){
      const group = await Group.findOne({where:{id:groupId}})
      const chats = await  group.getChats();

      console.log(chats);

    }

    // const ITEM_PER_PAGE = parseInt(req.query.rowPerPage || 5);
    // console.log(ITEM_PER_PAGE);
    // const chats = await Chat.findAll({
    //   include: [{
    //     model: User,
    //     attributes: ['name'] // Specify the attributes you want to retrieve from the User model
    //   }],
    //   attributes: ['id','message','createdAt'],
    //   where: {
    //     id: {
    //       [Op.gt]: lastChatId,
    //     },
    //   },
    //    // Specify the attributes you want to retrieve from the Chat model
    // })

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
