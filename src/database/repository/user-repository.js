const PositionModel = require("../models/Position");
const UserModel = require("../models/User");

const bcrypt = require("bcryptjs");

class UserRepository {
  async CreateUser(user) {
    const { name, email, phone, photo, positionId } = user;

    const result = await UserModel.create({
      name,
      email,
      phone,
      photo,
      positionId,
    });

    return result;
  }

  async GetAll(countOnPage, offset) {
    const data = await UserModel.findAndCountAll({
      include: [{ model: PositionModel, attributes: ["name"] }],
      order: [["registration_timestamp", "DESC"]],
      offset: offset,
      limit: countOnPage,
    });

    return data;
  }

  async GetUserById(id) {
    const result = await UserModel.findByPk(id, {
      include: [{ model: PositionModel}],
    });
    return result;
  }

  async IsEmailTaken(email) {
    const result = await UserModel.findOne({ where: { email } });
    if (result) return true;
    return false;
  }

  async IsPhoneTaken(phone) {
    const result = await UserModel.findOne({ where: { phone } });
    if (result) return true;
    return false;
  }
}

module.exports = UserRepository;
