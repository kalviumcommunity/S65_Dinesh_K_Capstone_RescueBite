const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser } = require('../controllers/user-controller');
const auth = require('../middlewares/auth');

router.post('/register', createUser);

router.post("/login", loginUser);

router.get('/users', auth, getAllUsers);

router.get('/:id', auth, getUserById);

router.put('/:id', auth, updateUser);

router.delete('/:id', auth, deleteUser);

module.exports = router;
