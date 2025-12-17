const express = require("express");
const router = express.Router();
const userControler= require('../controllers/userController')
const { registerValidator } = require("../middlewares/userValidations");

router.get("/test-users", userControler.getUsers)
router.post("/register", registerValidator, userControler.createUser)   
module.exports=router