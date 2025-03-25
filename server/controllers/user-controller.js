const User = require('../models/user-model');
const Food = require('../models/food-model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
  try { 
    const { firstName, lastName, email, password, phone, bio, address, role } = req.body;
    
   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      bio,
      address,
      role
    });

    const savedUser = await newUser.save();
    
    
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

   
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('swapHistory', 'name quantity description price');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('swapHistory', 'name quantity description price');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, swapHistory } = req.body;

   
    if (swapHistory) {
      const foods = await Food.find({ _id: { $in: swapHistory } });
      if (foods.length !== swapHistory.length) {
        return res.status(400).json({ message: 'Some food items in swapHistory do not exist' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, bio, swapHistory },
      { new: true }
    ).populate('swapHistory', 'name quantity description price');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser };
