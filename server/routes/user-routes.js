const express = require('express');
const { getUsers, addUser } = require('../controllers/user-controller');
const router = express.Router();


router.get('/users', getUsers);

router.post('/users', addUser);

module.exports = router;
