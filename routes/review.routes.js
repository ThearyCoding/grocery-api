const express = require("express");
const { createReview } = require("../controllers/review.controller");
const { AuthMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.post("/",AuthMiddleware,createReview);

module.exports = router;