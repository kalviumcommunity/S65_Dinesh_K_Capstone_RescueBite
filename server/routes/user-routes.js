const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user-controller');


router.post('/', createUser);


router.get('/users', getAllUsers);


router.get('/:id', getUserById);


router.put('/:id', updateUser);


router.delete('/:id', deleteUser);

module.exports = router;
