// const { FormateData } = require("../utils");
// const { APIError } = require("../utils/app-errors");

class PositionService {
  constructor(unitOfWork) {
    this.unit = unitOfWork;
  }

  async GetPositions() {
    return await this.unit.positionRepo.GetPositions();
    
  }
}

module.exports = PositionService;
