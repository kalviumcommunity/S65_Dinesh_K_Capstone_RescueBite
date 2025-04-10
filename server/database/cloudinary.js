const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Configure Cloudinary with fallback for development
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Check if Cloudinary is configured properly
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};



// Configure Cloudinary storage with additional error handling
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    resource_type: 'auto'
  }
});

// Configure food item storage with Cloudinary
const foodItemStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "food-items",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    resource_type: "auto"
  },
});

// Enhanced file filter to restrict to images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Initialize multer upload with file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter
});

// Initialize food item upload with file filter
const foodItemUpload = multer({
  storage: foodItemStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter
});

// Wrap upload middleware in a promise to handle errors better
const handleFoodItemUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    foodItemUpload.array("images", 5)(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  cloudinary,
  upload,
  isCloudinaryConfigured,
  foodItemUpload,
  handleFoodItemUpload
};
