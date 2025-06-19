const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { register, login, getCurrentUser } = require("../controllers/auth-controller");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Get current user route (with auth middleware)
router.get("/current-user", auth, getCurrentUser);

// Alternative route that your frontend might be calling
router.get("/me", auth, getCurrentUser);

// Test route to verify auth is working
router.get("/test", auth, (req, res) => {
  res.json({
    success: true,
    message: "Auth is working",
    user: req.user
  });
});

module.exports = router;