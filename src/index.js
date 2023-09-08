const express = require("express");
const { PORT } = require("./config");
const expressApp = require("./express-app");
const UnitOfWork = require("./database/repository/unitOfWork");

const StartServer = async () => {
  try {
    const app = express();
    const unitOfWork = new UnitOfWork();

    await expressApp(app, unitOfWork);

    app
      .listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
      })
      .on("error", (err) => {
        console.log(err);
        process.exit();
        
      });
  } catch (error) {
    console.log(error);
  }
};

StartServer();
