const AuthController = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();

router.post("/google-Signin", AuthController.googleSignin);

module.exports = router;