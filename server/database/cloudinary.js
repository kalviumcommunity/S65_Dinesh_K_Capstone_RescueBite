const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    resource_type: 'auto'
  }
});

const foodItemStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "food-items",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    resource_type: "auto"
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const foodItemUpload = multer({
  storage: foodItemStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

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
