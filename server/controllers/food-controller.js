const FoodItem = require("../models/food-model");
const User = require("../models/user-model");
const { cloudinary, handleFoodItemUpload, isCloudinaryConfigured } = require("../database/cloudinary");

// Get all food items with filtering and pagination
const getAllFoodItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      dietary,
      isFree,
      lat,
      lng,
      distance = 10, // in kilometers
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      includeExpired = false,
    } = req.query;

    console.log("Fetching food items, includeExpired:", includeExpired);
    
    // IMPORTANT: Always update expired items before returning results
    const now = new Date();
    console.log("Current time:", now.toISOString());
    
    // Bulk update any items that have expired
    const updateResult = await FoodItem.updateMany(
      { 
        expiresAt: { $lt: now },
        status: "available" 
      },
      { 
        $set: { status: "expired", isAvailable: false } 
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} expired food items`);

    // Build query
    // We're being explicit about the conditions to ensure we don't miss anything
    const query = { 
      status: includeExpired === 'true' ? { $in: ["available", "expired"] } : "available",
      isAvailable: includeExpired === 'true' ? { $in: [true, false] } : true
    };
    
    // Additional time check for extra certainty
    if (includeExpired !== 'true') {
      query.expiresAt = { $gt: now };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add dietary filters
    if (dietary) {
      const dietaryOptions = dietary.split(",");
      dietaryOptions.forEach((option) => {
        query[`dietary.${option}`] = true;
      });
    }

    // Add price filter
    if (isFree === "true") {
      query.isFree = true;
    }

    // Add search filter
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }

    // Add location filter
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)],
          },
          $maxDistance: Number.parseInt(distance) * 1000, // convert to meters
        },
      };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const foodItems = await FoodItem.find(query)
      .populate("owner", "firstName lastName businessName profileImage rating ratingCount accountType")
      .sort(sort)
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

    // Get total count
    const total = await FoodItem.countDocuments(query);

    // Add extra logging
    console.log(`Found ${foodItems.length} food items matching the criteria`);
    
    res.status(200).json({
      success: true,
      data: {
        foodItems,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        currentPage: Number.parseInt(page),
        total,
        timestamp: now.toISOString(), // Add timestamp to response for debugging
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching food items",
      error: error.message,
    });
  }
};

// Get a single food item
const getSingleFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id).populate(
      "owner",
      "firstName lastName businessName profileImage rating ratingCount accountType bio location",
    );

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching food item",
      error: error.message,
    });
  }
};

// Upload images to Cloudinary
const uploadFoodImages = async (req, res) => {
  try {
    // Verify Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Server is not configured for image uploads",
      });
    }
    
    // Handle the upload
    await handleFoodItemUpload(req, res);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    // Log the files for debugging
    console.log("Files received:", req.files.length);
    
    // Process Cloudinary response to include both URL and public ID
    const uploadedImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename || file.public_id
    }));

    console.log("Uploaded Images:", uploadedImages);

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: uploadedImages,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading images: " + error.message,
      error: error.message,
    });
  }
};

// Get Cloudinary status
const getCloudinaryStatus = async (req, res) => {
  try {
    const status = {
      configured: isCloudinaryConfigured(),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
      apiSecretExists: !!process.env.CLOUDINARY_API_SECRET
    };
    
    res.status(200).json({
      success: true,
      message: "Cloudinary configuration status",
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking Cloudinary status",
      error: error.message
    });
  }
};

// Create a new food item
const createFoodItem = async (req, res) => {
  try {
    console.log("Creating food item with data:", JSON.stringify(req.body, null, 2));
    
    const {
      title,
      description,
      images,
      quantity,
      quantityUnit,
      category,
      dietary,
      expiresAt,
      location,
      price,
      originalPrice,
      isFree,
      isPickupOnly,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Handle dietary preferences with defaults
    const dietaryPrefs = {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false,
      ...dietary
    };

    // Process location data
    const locationObj = {
      type: "Point",
      coordinates: [0, 0],
      address: ""
    };
    
    if (location) {
      locationObj.address = location.address || "";
      if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
        locationObj.coordinates = location.coordinates.map(coord => 
          typeof coord === 'string' ? parseFloat(coord) : coord
        );
      }
    }

    // Format expiration date and ensure it's not in the past
    let expirationDate;
    try {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        // If invalid or in the past, set to 24 hours from now
        console.log("Adjusting invalid expiration date that was:", expiresAt);
        expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 1);
      }
    } catch (err) {
      console.error("Date parsing error:", err);
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1);
    }

    // Process image data to match schema requirements
    // Convert image objects to just URLs if needed
    const processedImages = [];
    if (images && Array.isArray(images)) {
      images.forEach(img => {
        if (typeof img === 'string') {
          // If it's already a string URL, use it directly
          processedImages.push(img);
        } else if (img && img.url) {
          // If it's an object with a URL property, use just the URL
          processedImages.push(img.url);
        }
      });
    }

    console.log("Processed images for MongoDB:", processedImages);

    // Create food item with safe defaults
    const foodItem = new FoodItem({
      title: title.trim(),
      description: description.trim(),
      images: processedImages, // Now using the properly formatted images
      quantity: parseInt(quantity) || 1,
      quantityUnit: quantityUnit || "servings",
      category: category || "other",
      dietary: dietaryPrefs,
      expiresAt: expirationDate,
      location: locationObj,
      price: isFree ? 0 : (parseFloat(price) || 0),
      originalPrice: parseFloat(originalPrice) || 0,
      isFree: !!isFree,
      isPickupOnly: isPickupOnly !== false,
      owner: req.user.id,
      status: "available"
    });

    // Save the food item
    const savedItem = await foodItem.save();
    console.log("Food item saved successfully:", savedItem._id);
    
    // Update user's itemsShared count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { itemsShared: 1 },
    });

    return res.status(201).json({
      success: true,
      message: "Food item created successfully",
      data: savedItem,
    });
  } catch (error) {
    console.error("Error creating food item:", error);
    
    // Improved error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.keys(error.errors).map(field => ({
          field,
          message: error.errors[field].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating food item: " + error.message,
      error: error.message
    });
  }
};

// Update a food item
const updateFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Check if user is the owner
    if (foodItem.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this food item",
      });
    }

    // Handle image removals if necessary
    if (req.body.removedImages && req.body.removedImages.length > 0) {
      for (const imageId of req.body.removedImages) {
        await cloudinary.uploader.destroy(imageId);
      }
    }

    // Update food item
    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      data: updatedFoodItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating food item",
      error: error.message,
    });
  }
};

// Delete a food item
const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Check if user is the owner
    if (foodItem.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this food item",
      });
    }

    // Delete images from Cloudinary
    if (foodItem.images && foodItem.images.length > 0) {
      for (const image of foodItem.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await FoodItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting food item",
      error: error.message,
    });
  }
};

// Get food items by user - modified to support showing expired items
const getUserFoodItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, includeExpired = true } = req.query;

    const query = { owner: req.params.userId };

    if (status) {
      query.status = status;
    }

    // Mark expired items automatically before returning results
    // This ensures items show with the correct expired status
    const now = new Date();
    await FoodItem.updateMany(
      { 
        expiresAt: { $lt: now },
        status: "available" 
      },
      { 
        $set: { status: "expired", isAvailable: false } 
      }
    );

    const foodItems = await FoodItem.find(query)
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

    const total = await FoodItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        foodItems,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        currentPage: Number.parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user food items",
      error: error.message,
    });
  }
};


const getFoodItemsByCurrentUser = async (req, res) => {
  try {
    // Get page and limit from query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get status filter if provided
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    
    // Create a query object to find items for this user
    // We need to handle both user types (individual and organization)
    const userId = req.user.id;
    const userType = req.user.accountType;
    
    let query = {};
    
    if (userType === 'organization') {
      // For organizations, find items where they are the owner
      query = { 
        ...statusFilter,
        organization: userId 
      };
    } else {
      // For individuals, find items where they are the owner
      query = { 
        ...statusFilter,
        owner: userId 
      };
    }
    
    // Count total items for pagination
    const total = await FoodItem.countDocuments(query);
    
    // Get food items with pagination
    const foodItems = await FoodItem.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // If no items found, return empty array
    if (!foodItems) {
      return res.status(200).json({
        success: true,
        data: {
          foodItems: []
        }
      });
    }
    
    // Return food items with pagination info
    res.status(200).json({
      success: true,
      count: foodItems.length,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      },
      data: {
        foodItems
      }
    });
  } catch (error) {
    console.error('Error in getFoodItemsByCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

module.exports = {
  getAllFoodItems,
  getSingleFoodItem,
  uploadFoodImages,
  getCloudinaryStatus,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  getUserFoodItems,
  getFoodItemsByCurrentUser
};
