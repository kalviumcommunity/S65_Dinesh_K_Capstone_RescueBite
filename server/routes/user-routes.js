const express = require("express");
const userController = require("../controllers/user-controller");
const auth = require("../middlewares/auth");
const { upload } = require("../database/cloudinary");

const router = express.Router();

// User profile routes
router.get("/profile/:id", userController.getUserProfile);
router.put("/profile", auth, userController.updateUserProfile);
router.get("/:id/reviews", userController.getUserReviews);
router.post('/upload-image', auth, userController.uploadProfileImage);
router.get("/cloudinary-status", userController.getCloudinaryStatus);
router.get("/me", auth, userController.getCurrentUserProfile);

// Add dedicated password update route (uses same controller)
router.put("/password", auth, userController.updateUserProfile);

// Add these new settings routes
router.put("/settings/privacy", auth, userController.updatePrivacySettings);
router.put("/settings/notifications", auth, userController.updateNotificationSettings);
router.delete("/account", auth, userController.deleteUserAccount);

module.exports = router;
