const UserService = require("../services/user-service");
const asyncHandler = require("express-async-handler");
const { URL_Postfix } = require("../config");

module.exports = (app, unitOfWork) => {
  const service = new UserService(unitOfWork);

  app.get(
    `${URL_Postfix}/token`,
    asyncHandler(async (req, res, next) => {
      const token = service.CreateJWTToken("name");
      return res.json({ success: true, token });
    })
  );

  app.post(
    `${URL_Postfix}/user`,
    asyncHandler(async (req, res, next) => {
      if (service.IsTokenExpired(req))
        return res.status(401).json({
          success: false,
          message: "The token expired.",
        });

      const result = await service.CreateUser(req);
      if (!result.success) return res.status(422).json(result);

      return res.json(result);
    })
  );

  app.get(
    `${URL_Postfix}/users`,
    asyncHandler(async (req, res, next) => {
      let count = parseInt(req.query.count) || 5;
      let page = parseInt(req.query.page) || 1;

      const error = {};
      if (!page) {
        error["page"] = ["The page must be at least 1."];
      }

      if (typeof count != "number") {
        error["count"] = ["The count must be an integer."];
      }
      if ("page" in error || "count" in error) {
        return res.status(422).json({
          success: false,
          message: "Validation failed",
          fails: { ...error },
        });
      }

      page = Math.max(1, page);
      count = Math.max(1, Math.min(100, count));

      const offset = parseInt(req.query.offset) || (page - 1) * count;

      const data = await service.GetAll(count, offset, page);

      return res.json(data);
    })
  );

  app.get(
    `${URL_Postfix}/user/:id`,
    asyncHandler(async (req, res, next) => {
      const id = req.params.id;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          fails: {
            user_id: ["The user_id must be an integer."],
          },
        });
      }
      const result = await service.GetUserById(id);

      if (result && result.success == false) {
        return res.status(404).json(result);
      }

      return res.json(result);
    })
  );
};
