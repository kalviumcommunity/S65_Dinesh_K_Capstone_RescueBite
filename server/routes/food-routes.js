const express = require('express');
const router = express.Router();
const { getAllFood,getFoodById,createFood } = require('../controllers/food-controller');

router.get('/', getAllFood);

router.get('/:id', getFoodById);


router.post('/', createFood);

module.exports = router;
