'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ChatArchive', {
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
     
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ChatArchive');
  }
};
