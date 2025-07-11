const User = require("../models/user-model");
const FoodItem = require("../models/food-model");
const Swap = require("../models/swap-model");
const { upload, isCloudinaryConfigured } = require("../database/cloudinary");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const foodItemsCount = await FoodItem.countDocuments({ owner: req.params.id });
    const activeListingsCount = await FoodItem.countDocuments({
      owner: req.params.id,
      isAvailable: true,
      status: "available",
    });

    const avgRating = user.ratingCount > 0 ? (user.rating / user.ratingCount).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        avgRating,
        foodItemsCount,
        activeListingsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, businessName, businessType, businessAddress, bio, location, phone, profileImage, currentPassword, newPassword } =
      req.body;

    if (currentPassword && newPassword) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully"
      });
    }

    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (businessName !== undefined) updateFields.businessName = businessName;
    if (businessType !== undefined) updateFields.businessType = businessType;
    if (businessAddress !== undefined) updateFields.businessAddress = businessAddress;
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;

    if (location) {
      updateFields.location = {
        type: "Point",
        coordinates: Array.isArray(location.coordinates) 
          ? location.coordinates.map(coord => typeof coord === 'string' ? parseFloat(coord) : coord)
          : [0, 0],
        address: location.address || ""
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const swaps = await Swap.find({
      $or: [
        { provider: req.params.id, requesterReview: { $exists: true, $ne: "" } },
        { requester: req.params.id, providerReview: { $exists: true, $ne: "" } },
      ],
      status: "completed",
    })
      .populate({
        path: "requester",
        select: "firstName lastName businessName profileImage",
      })
      .populate({
        path: "provider",
        select: "firstName lastName businessName profileImage",
      })
      .populate({
        path: "foodItem",
        select: "title",
      })
      .sort({ updatedAt: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

    const reviews = swaps.map((swap) => {
      if (swap.provider._id.toString() === req.params.id) {
        return {
          id: swap._id,
          rating: swap.requesterRating,
          review: swap.requesterReview,
          reviewer: swap.requester,
          foodItem: swap.foodItem,
          date: swap.updatedAt,
          isProvider: true,
        };
      } else {
        return {
          id: swap._id,
          rating: swap.providerRating,
          review: swap.providerReview,
          reviewer: swap.provider,
          foodItem: swap.foodItem,
          date: swap.updatedAt,
          isProvider: false,
        };
      }
    });

    const total = await Swap.countDocuments({
      $or: [
        { provider: req.params.id, requesterReview: { $exists: true, $ne: "" } },
        { requester: req.params.id, providerReview: { $exists: true, $ne: "" } },
      ],
      status: "completed",
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        currentPage: Number.parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user reviews",
      error: error.message,
    });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Server is not configured for image uploads. Missing Cloudinary credentials."
      });
    }
    
    upload.single('profileImage')(req, res, async function(err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Error uploading file",
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      try {
        const user = await User.findByIdAndUpdate(
          req.user.id,
          { 
            profileImage: req.file.path,
            profileImageId: req.file.filename || req.file.public_id 
          },
          { new: true }
        ).select("-password");

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }

        res.status(200).json({
          success: true,
          imageUrl: req.file.path,
          data: user
        });
      } catch (dbError) {
        res.status(500).json({
          success: false,
          message: "Error updating user profile with new image",
          error: dbError.message
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during image upload",
      error: error.message
    });
  }
};

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

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (user.trustScore === undefined) {
      user.trustScore = 0;
      await user.save();
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user profile", error: error.message });
  }
};

// Update privacy settings
const updatePrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Create settings object if it doesn't exist
    if (!user.settings) {
      user.settings = {};
    }
    
    // Update privacy settings
    user.settings.privacy = req.body;
    
    // Handle trust score visibility specifically
    if (req.body.trustScore && typeof req.body.trustScore.visible !== 'undefined') {
      if (!user.settings.trustScore) {
        user.settings.trustScore = {};
      }
      user.settings.trustScore.visible = req.body.trustScore.visible;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Privacy settings updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating privacy settings",
      error: error.message
    });
  }
};

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Create settings object if it doesn't exist
    if (!user.settings) {
      user.settings = {};
    }
    
    user.settings.notifications = req.body;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating notification settings",
      error: error.message
    });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Delete user's food items
    await FoodItem.deleteMany({ owner: req.user.id });
    
    // Delete user's swaps or update them
    // You might want to handle this differently depending on your app's requirements
    await Swap.deleteMany({ 
      $or: [
        { requester: req.user.id },
        { provider: req.user.id }
      ]
    });
    
    // Delete the user
    await User.findByIdAndDelete(req.user.id);
    
    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserReviews,
  uploadProfileImage,
  getCloudinaryStatus,
  getCurrentUserProfile,
  updatePrivacySettings,
  updateNotificationSettings,
  deleteUserAccount
};
