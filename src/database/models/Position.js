const { DataTypes } = require("sequelize");
const sequelize = require("../connection.js");


const PositionModel = sequelize.define("position", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  
},{
    timestamps:false
});




// sequelize.sync({alter:true}).then(() => {
//     console.log('Question table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });

module.exports = PositionModel;
