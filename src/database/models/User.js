const { DataTypes,Deferrable } = require("sequelize");
const sequelize = require("../connection.js");
const PositionModel = require("./Position.js");


const UserModel = sequelize.define("user", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING,
  },
  positionId: {
    type: DataTypes.INTEGER,
    references: {
      model: PositionModel,
      key: "id",
      deferrable: Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  registration_timestamp:{
    type: DataTypes.BIGINT,
    defaultValue: new Date().getTime()
  }
},{
  timestamps:false
});



UserModel.belongsTo(PositionModel)


// sequelize
//   .sync({ force: true })
//   .then(() => {
//     console.log("user table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });

module.exports = UserModel;
