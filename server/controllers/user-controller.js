const users = require('../userData');

const getUsers = function (req, res) {
    try {
        res.status(200).json({ userDetails: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addUser = function (req, res) {
    try {
        const { firstName, lastName, email, password, phone, bio, role } = req.body;

        if (!firstName || !lastName || !email || !password || !phone || !bio || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newUser = { firstName, lastName, email, password, phone, bio, role };
        users.push(newUser);

        res.status(201).json({ message: "User added successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, addUser };
