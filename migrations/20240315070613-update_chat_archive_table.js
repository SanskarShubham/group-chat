'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('ChatArchive', 'createdAt', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }),
      queryInterface.addColumn('ChatArchive', 'updatedAt', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }),
      // Add more columns as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('ChatArchive', 'createdAt'),
      queryInterface.removeColumn('ChatArchive', 'updatedAt'),
      // Remove other columns in reverse order
    ]);
  }
};
