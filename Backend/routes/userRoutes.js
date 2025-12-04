const express = require("express");
const router = express.Router();
const userControler= require('../controllers/userController')

router.get("/test-users", userControler.getUsers)
module.exports=router