const Food = require('../models/food-model');


 const createFood = async (req, res) => {
  try {
    const { name, quantity, description, price, availability } = req.body;
    const newFood = new Food({
      name,
      quantity,
      description,
      price,
      availability
    });
    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    res.status(500).json({ message: 'Error creating food item', error: error.message });
  }
};


const getAllFood = async (req, res) => {
  try {
    const foodItems = await Food.find();
    res.status(200).json(foodItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food items', error: error.message });
  }
};


const getFoodById = async (req, res) => {
  try {
    const foodItem = await Food.findById(req.params.id);
    if (!foodItem) return res.status(404).json({ message: 'Food item not found' });
    res.status(200).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food item', error: error.message });
  }
};

module.exports = { createFood,getAllFood,getFoodById }