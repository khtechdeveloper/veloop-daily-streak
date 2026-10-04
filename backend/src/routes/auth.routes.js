const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../validators/auth.validator");
const requireAuth = require("../middleware/auth.middleware");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, me);

module.exports = router;
