const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
    {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        dialectOptions: {
         
            dateStrings: true,
            typeCast: true,
            timezone: "+05:30"
          },
          timezone: "+05:30", //for writing to database
          operatorsAliases: false
    })

module.exports = sequelize;