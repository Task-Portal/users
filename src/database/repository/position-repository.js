const  PositionModel = require("../models/Position");

class PositionRepository {
  async GetPositions() {
    return await PositionModel.findAll();
  }
}

module.exports = PositionRepository;
