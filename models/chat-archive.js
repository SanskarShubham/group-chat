const {Sequelize} = require('sequelize');
const sequelize = require('../util/database');

const Chat = sequelize.define('ChatArchive',{
    id:{
      type: Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true
    },
    message:{
      type: Sequelize.STRING
    },
    type: Sequelize.STRING,
    fileName: Sequelize.STRING,
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  })

  module.exports = Chat;
