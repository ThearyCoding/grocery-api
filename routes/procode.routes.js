const express = require('express');
const { createPromoCode, applyPromoCode, getAllPromoCodes } = require('../controllers/promo-code/promocode.controller');
const { AuthMiddleware } = require('../middlewares/auth');
const router = express.Router();



 
router.post("/admin/",createPromoCode );
router.get("/admin/",getAllPromoCodes );
router.post("/mobile/apply",AuthMiddleware,applyPromoCode );

module.exports = router;