const {Sequelize} = require('sequelize');
const sequelize = require('../util/database');

const Chat = sequelize.define('chat',{
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
    fileName: Sequelize.STRING
  })

  module.exports = Chat;
