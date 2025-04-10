const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password, phone, bio, address, role } = req.body;
  
  if (!firstName || !lastName || !email || !password || !phone || !bio || !address || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }
  
  // Password validation (minimum 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin
}; 