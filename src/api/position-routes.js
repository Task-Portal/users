const PositionService = require("../services/position-service");
const asyncHandler = require("express-async-handler");
const {URL_Postfix} = require("../config")

module.exports = (app, unitOfWork) => {
  const service = new PositionService(unitOfWork);

  /**
   * @api {get} api/v1/positions Request List of Positions
   * @apiName GetPositions
   * @apiGroup Positions
   *
   * @apiSuccess {Boolean} success Indicates whether the request was successful.
   * @apiSuccess {Object[]} positions List of positions.
   * @apiSuccess {Number} positions.id Position ID.
   * @apiSuccess {String} positions.name Position name.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "positions": [
   *         {
   *           "id": 1,
   *           "name": "Security"
   *         },
   *         {
   *           "id": 4,
   *           "name": "Lawyer"
   *         }
   *       ]
   *     }
   *
   * @apiError {Boolean} success Indicates whether the request was successful (always false for error responses).
   * @apiError {String} message Error message.
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "success": false,
   *       "message": "Positions not found"
   *     }
   */

  app.get(
    `${URL_Postfix}/positions`,
    asyncHandler(async (req, res, next) => {
      const data = await service.GetPositions();

      if (data.length==0) {
        return res
          .status(422)
          .json({ success: false, message: "Positions not found" });
      }

      return res.json({success:true, positions:data});
    })
  );
};
