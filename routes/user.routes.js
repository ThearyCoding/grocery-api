const UserController = require("../controllers/user.controller");
const exprees = require("express");
const authMiddleware = require("../middlewares/auth");

const router  = exprees.Router();

router.post("/register",UserController.register);
router.post("/login",UserController.login);
router.get("/profile",authMiddleware.authMedddleware,  UserController.getUser)
module.exports = router;