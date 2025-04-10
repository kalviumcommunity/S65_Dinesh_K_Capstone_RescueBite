const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user data to request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid',
        });
    }
};

module.exports = auth;
