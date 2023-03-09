'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert('Tags', [{
      name: 'Tag 1',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'Tag 2',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'Tag 3',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Tags');
  }
};
