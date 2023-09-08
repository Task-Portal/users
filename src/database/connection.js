
const { Sequelize } = require("sequelize");
const { DB_DIALECT, DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } = require("../config");

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
});





//   const testDbConnection = async () => {
//     try {
//       await sequelize.authenticate();
//       console.log("Connection has been established successfully.");
//     } catch (error) {
//       console.error("Unable to connect to the database:", error);
//     }
//   };
// testDbConnection()

// sequelize.sync({ force: false }) // Make sure this is not set to "true"
//   .then(() => {
//     console.log('Database synced successfully.');
//   })
//   .catch((err) => {
//     console.error('Database sync error:', err);
//   });
module.exports = sequelize; // Export the Sequelize instance directly


