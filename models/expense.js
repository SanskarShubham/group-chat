const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('expenses',{
    id:{
      type: Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true
    },
    amount: Sequelize.DOUBLE,
    description:{
      type: Sequelize.STRING,
    },
    category:{
      type: Sequelize.STRING
    }
  })

  module.exports = User;

