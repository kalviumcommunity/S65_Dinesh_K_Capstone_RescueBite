const express = require("express");
const auth = require("../middlewares/auth");
const foodController = require("../controllers/food-controller");

const router = express.Router();

// Get food items routes
router.get("/", foodController.getAllFoodItems);
router.get("/:id", foodController.getSingleFoodItem);
router.get("/user/:userId", foodController.getUserFoodItems);
router.get("/cloudinary-status", foodController.getCloudinaryStatus);
router.get('/my-items', auth, foodController.getFoodItemsByCurrentUser);

// Create and manage food items routes
router.post("/", auth, foodController.createFoodItem);
router.post("/upload", auth, foodController.uploadFoodImages);
router.put("/:id", auth, foodController.updateFoodItem);
router.delete("/:id", auth, foodController.deleteFoodItem);

module.exports = router;
