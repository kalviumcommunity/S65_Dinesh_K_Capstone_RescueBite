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


const updateUser = (req, res) => {
    try {
        const { email } = req.params;
        const { firstName, lastName, password, phone, bio, role } = req.body;

        const findIndex = users.findIndex(user => user.email === email);
        if (findIndex !== -1) {
            const updatedUser = { 
                firstName: firstName || users[findIndex].firstName, 
                lastName: lastName || users[findIndex].lastName, 
                email, 
                password: password || users[findIndex].password,
                phone: phone || users[findIndex].phone,
                bio: bio || users[findIndex].bio,
                role: role || users[findIndex].role
            };
            users[findIndex] = updatedUser;
            return res.status(200).json({ message: "User Updated Successfully..." });
        }
        return res.status(400).json({ message: "User Not Found!" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


module.exports = { getUsers, addUser, updateUser };
