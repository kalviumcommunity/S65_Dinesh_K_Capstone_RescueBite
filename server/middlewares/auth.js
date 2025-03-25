const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ message: 'Token verification failed' });
        }

        req.user = verified.id;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Token verification failed' });
    }
};

module.exports = auth;
