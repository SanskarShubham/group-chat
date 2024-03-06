const {Sequelize} = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('users',{
    id:{
      type: Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true
    },
    name: Sequelize.STRING,
    email:{
        type: Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    password:{
      type: Sequelize.STRING,
      allowNull:false
    },
    isPremium: Sequelize.BOOLEAN,
    totalExpense: Sequelize.DOUBLE
  })

  module.exports = User;

