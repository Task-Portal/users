
const databaseConnection = require("../connection");
const UserRepository = require("./user-repository");
const PositionRepository = require("./position-repository")

class UnitOfWork {
  constructor() {
    this.#connectToDB();

    this.userRepo = new UserRepository();
    this.positionRepo = new PositionRepository();
  }

  async #connectToDB() {
    await databaseConnection.authenticate();
  }
}

module.exports = UnitOfWork;
