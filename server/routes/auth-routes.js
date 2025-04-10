const express = require("express");
const router = express.Router();
const { register, login, getCurrentUser } = require("../controllers/auth-controller");

// You'll need to create validation middleware or import it
// const { validateRegistration, validateLogin } = require("../middleware/validation");

// Register a new user
router.post("/register", register); // Add validateRegistration when available

// Login user
router.post("/login", login); // Add validateLogin when available

// Get current user
router.get("/me", getCurrentUser);

module.exports = router;
