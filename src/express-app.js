const express = require("express");
const cors = require("cors");
const { position, user} = require("./api");
const cookieParser = require("cookie-parser");

module.exports = async (app, unitOfWork) => {
  
    app.use(cookieParser());
    app.use(express.json({ limit: "5mb" }));
    app.use(express.urlencoded({ extended: true, limit: "5mb" }));
    app.use(express.static("build"));
    app.disable("x-powered-by");

    
    user(app, unitOfWork);
    position(app, unitOfWork);
    
 

    app.use(async(req,res,next)=>{
      res.status(404).json({
               "success": false,
              "message": "Page not found"
            })
    })
    // error handling
    // app.use(HandleErrors);
 
};
