const express = require('express');
const { createPromoCode, applyPromoCode, getAllPromoCodes } = require('../controllers/promo-code/promocode.controller');
const { authMedddleware } = require('../middlewares/auth');
const router = express.Router();



 
router.post("/admin/",createPromoCode );
router.get("/admin/",getAllPromoCodes );
router.post("/mobile/apply",authMedddleware,applyPromoCode );

module.exports = router;