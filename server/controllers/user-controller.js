const users = require('../userData');

const getUsers = function (req, res) {
    try {
        res.status(200).json({userDetails: users})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {getUsers}