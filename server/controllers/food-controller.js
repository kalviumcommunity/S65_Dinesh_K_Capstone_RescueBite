const Food = require('../models/food-model');
const mongoose = require('mongoose');
const User = require('../models/user-model')


const createFood = async (req, res) => {
  try {
    const { name, quantity, description, price, listedBy, availability } = req.body;

    if (!mongoose.Types.ObjectId.isValid(listedBy)) {
      return res.status(400).json({ message: 'Invalid User ID for listedBy' });
    }

    const userExists = await User.findById(listedBy);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newFood = new Food({
      name,
      quantity,
      description,
      price,
      listedBy: new mongoose.Types.ObjectId(listedBy), // Ensure it's always an ObjectId
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
    const foodItems = await Food.find()
      .populate({
        path: "listedBy",
        select: "firstName lastName email",
        match: { _id: { $exists: true, $type: 'objectId' } } // Ensures only valid ObjectId users are populated
      });

    res.status(200).json(foodItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching food items", error: error.message });
  }
};



const getFoodById = async (req, res) => {
  try {
    const foodItem = await Food.findById(req.params.id).populate('listedBy', 'firstName lastName email');
    if (!foodItem) return res.status(404).json({ message: 'Food item not found' });
    res.status(200).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food item', error: error.message });
  }
};

const deleteFood = async (req, res) => {
  try {
    const foodItem = await Food.findById(req.params.id);
    if (!foodItem) return res.status(404).json({ message: 'Food item not found' });

    await foodItem.deleteOne();
    res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting food item', error: error.message });
  }
};

module.exports = { createFood, getAllFood, getFoodById, deleteFood };
