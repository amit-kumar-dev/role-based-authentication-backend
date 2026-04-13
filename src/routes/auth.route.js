const express = require("express");
const { route } = require("../app");
const authController = require("../controllers/auth.controller");

const router = express.Router();
router.post("/register", authController.registerUser);
router.post("/logInUser", authController.logInUser);

module.exports = router;
