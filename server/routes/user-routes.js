const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser } = require('../controllers/user-controller');


router.post('/register', createUser);

router.post("/login", loginUser);

router.get('/users', getAllUsers);


router.get('/:id', getUserById);


router.put('/:id', updateUser);


router.delete('/:id', deleteUser);

module.exports = router;
