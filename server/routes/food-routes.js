const express = require('express');
const router = express.Router();
const { getAllFood,getFoodById,createFood,deleteFood } = require('../controllers/food-controller');

router.get('/', getAllFood);

router.get('/:id', getFoodById);


router.post('/', createFood);

router.delete('/:id', deleteFood);

module.exports = router;
