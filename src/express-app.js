const express = require("express");
const cors = require("cors");
const { position, user} = require("./api");
// const HandleErrors = require("./utils/error-handler");
const cookieParser = require("cookie-parser");

module.exports = async (app, unitOfWork) => {
  
    app.use(cookieParser());
    app.use(express.json({ limit: "5mb" }));
    app.use(express.urlencoded({ extended: true, limit: "5mb" }));
    app.use(cors());
    app.use(express.static(__dirname + "/public"));
    app.disable("x-powered-by");


    user(app, unitOfWork);
    position(app, unitOfWork);
    
 

    app.use(async (req, res, next) => {
      console.log("Req", req);
      next();
    });

    app.use(async(req,res,next)=>{
      res.status(404).json({
               "success": false,
              "message": "Page not found"
            })
    })
    // error handling
    // app.use(HandleErrors);
 
};
