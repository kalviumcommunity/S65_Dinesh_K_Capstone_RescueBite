const Swap = require("../models/swap-model");
const FoodItem = require("../models/food-model");
const User = require("../models/user-model");

const getMySwaps = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      role = "all",
    } = req.query;

    const query = {};

    if (role === "requester") {
      query.requester = req.user.id;
    } else if (role === "provider") {
      query.provider = req.user.id;
    } else {
      query.$or = [{ requester: req.user.id }, { provider: req.user.id }];
    }

    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate({
        path: "foodItem",
        select: "title images quantity quantityUnit price isFree status",
      })
      .populate({
        path: "offeredItem",
        select: "title images quantity quantityUnit price isFree status",
      })
      .populate({
        path: "requester",
        select: "firstName lastName businessName profileImage email phone location",
      })
      .populate({
        path: "provider",
        select: "firstName lastName businessName profileImage email phone location",
      })
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

    const total = await Swap.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        swaps,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        currentPage: Number.parseInt(page),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching swaps:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching swaps",
      error: error.message,
    });
  }
};

const getPendingSwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      provider: req.user.id,
      status: 'pending'
    })
    .populate({
      path: "foodItem",
      select: "title images quantity quantityUnit price isFree status"
    })
    .populate({
      path: "requester",
      select: "firstName lastName businessName profileImage email phone location"
    })
    .populate({
      path: "provider",
      select: "firstName lastName businessName profileImage email phone location"
    });

    res.status(200).json({
      success: true,
      data: swaps,
    });
  } catch (error) {
    console.error("Error fetching pending swaps:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending swaps",
      error: error.message,
    });
  }
};

const getSingleSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate({
        path: "foodItem",
        select: "title description images quantity quantityUnit price isFree location expiresAt",
        populate: {
          path: "owner",
          select: "firstName lastName businessName profileImage",
        },
      })
      .populate({
        path: "offeredItem",
        select: "title description images quantity quantityUnit price isFree location expiresAt",
        populate: {
          path: "owner",
          select: "firstName lastName businessName profileImage",
        },
      })
      .populate({
        path: "requester",
        select: "firstName lastName businessName profileImage rating ratingCount",
      })
      .populate({
        path: "provider",
        select: "firstName lastName businessName profileImage rating ratingCount",
      });

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found",
      });
    }

    if (swap.requester._id.toString() !== req.user.id && swap.provider._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this swap",
      });
    }

    res.status(200).json({
      success: true,
      data: swap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching swap",
      error: error.message,
    });
  }
};

const createSwap = async (req, res) => {
  try {
    const { foodItemId, message, offeredItemId, isSwap, isPurchase } = req.body;

    if (!foodItemId) {
      return res.status(400).json({
        success: false,
        message: "Food item ID is required"
      });
    }

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem || !foodItem.isAvailable || foodItem.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: "Food item is not available"
      });
    }

    if (foodItem.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot request your own food item"
      });
    }

    const swapData = {
      requester: req.user.id,
      provider: foodItem.owner,
      foodItem: foodItemId,
      message,
      isSwap: Boolean(isSwap),
      isPurchase: Boolean(isPurchase),
      status: 'pending',
      requesterRating: 0,
      providerRating: 0,
      amount: isPurchase ? foodItem.price : 0
    };

    if (isSwap && offeredItemId) {
      const offeredItem = await FoodItem.findById(offeredItemId);
      if (!offeredItem || !offeredItem.isAvailable || offeredItem.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: "Offered item is not available"
        });
      }

      if (offeredItem.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to offer this item"
        });
      }

      swapData.offeredItem = offeredItemId;
    }

    const swap = new Swap(swapData);
    await swap.save();

    await FoodItem.findByIdAndUpdate(foodItemId, {
      status: 'reserved',
      updatedAt: Date.now()
    });

    if (isSwap && offeredItemId) {
      await FoodItem.findByIdAndUpdate(offeredItemId, {
        status: 'reserved',
        updatedAt: Date.now()
      });
    }

    const populatedSwap = await Swap.findById(swap._id)
      .populate('foodItem')
      .populate('offeredItem')
      .populate('requester', 'firstName lastName businessName profileImage')
      .populate('provider', 'firstName lastName businessName profileImage');

    res.status(201).json({
      success: true,
      message: "Swap request created successfully",
      data: populatedSwap
    });

  } catch (error) {
    console.error("Swap creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating swap request",
      error: error.message
    });
  }
};

const updateSwapStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found",
      });
    }

    if (swap.provider.toString() !== req.user.id && swap.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this swap",
      });
    }

    const validStatusChanges = {
      pending: ["accepted", "rejected", "cancelled"],
      accepted: ["completed", "cancelled"],
      rejected: [],
      completed: [],
      cancelled: [],
    };

    if (!validStatusChanges[swap.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${swap.status} to ${status}`,
      });
    }

    if (status === "accepted" || status === "rejected") {
      if (swap.provider.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Only the provider can accept or reject a swap",
        });
      }
    } else if (status === "completed") {
      if (swap.requester.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Only the requester can mark a swap as completed",
        });
      }
    }

    swap.status = status;
    swap.updatedAt = Date.now();
    await swap.save();

    if (status === "rejected" || status === "cancelled") {
      await FoodItem.findByIdAndUpdate(swap.foodItem, {
        status: "available",
        updatedAt: Date.now(),
      });

      if (swap.isSwap && swap.offeredItem) {
        await FoodItem.findByIdAndUpdate(swap.offeredItem, {
          status: "available",
          updatedAt: Date.now(),
        });
      }
    } else if (status === "completed") {
      // Mark food item as completed
      await FoodItem.findByIdAndUpdate(swap.foodItem, {
        status: "completed",
        isAvailable: false,
        updatedAt: Date.now(),
      });

      // If it's a swap, mark offered item as completed
      if (swap.isSwap && swap.offeredItem) {
        await FoodItem.findByIdAndUpdate(swap.offeredItem, {
          status: "completed",
          isAvailable: false,
          updatedAt: Date.now(),
        });
      }

      // Update user stats - increase items count for completed swaps
      await User.findByIdAndUpdate(swap.requester, {
        $inc: { itemsReceived: 1 },
        needsReview: true // Mark that this user needs to leave a review
      });

      // Also update provider stats
      await User.findByIdAndUpdate(swap.provider, {
        $inc: { itemsShared: 1 },
      });

      if (swap.isSwap && swap.offeredItem) {
        await User.findByIdAndUpdate(swap.provider, {
          $inc: { itemsReceived: 1 },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Swap status updated to ${status}`,
      data: swap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating swap status",
      error: error.message,
    });
  }
};

// Review a swap
const reviewSwap = async (req, res) => {
  try {
    const { rating, review, reviewFor, accountType } = req.body;

    // Get the swap
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found",
      });
    }

    // Check if swap is completed
    if (swap.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed swaps",
      });
    }

    // Check if user is part of the swap
    if (swap.requester.toString() !== req.user.id && swap.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to review this swap",
      });
    }
    
    // IMPORTANT FIX: Only the recipient should be able to review the provider
    // For regular swaps, the requester is the recipient
    // For swap transactions, if the swap has offeredItem, both users can review each other
    const hasOfferedItem = swap.isSwap && swap.offeredItem;
    
    // Ensure rating is between 1-5
    const validRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 1));

    // Update the appropriate rating and review
    if (reviewFor === "provider" && swap.requester.toString() === req.user.id) {
      // Requester reviewing provider (allowed)
      swap.providerRating = validRating;
      swap.providerReview = review;
      
      // Update provider's rating and trust score
      const provider = await User.findById(swap.provider);
      provider.rating = (provider.rating || 0) + validRating;
      provider.ratingCount = (provider.ratingCount || 0) + 1;
      
      // Calculate new trust score based on rating average and swap count
      const avgRating = provider.ratingCount > 0 ? provider.rating / provider.ratingCount : 0;
      const swapCount = (provider.itemsShared || 0) + (provider.itemsReceived || 0);
      
      // Trust score formula: 
      // 70% based on average rating (scaled to 0-70) + 
      // 30% based on number of swaps (capped at 20 swaps for max points)
      const ratingComponent = (avgRating / 5) * 70;
      const swapComponent = Math.min(swapCount, 20) / 20 * 30;
      
      provider.trustScore = Math.round(ratingComponent + swapComponent);
      
      // IMPORTANT: Preserve the accountType to prevent validation error
      if (!provider.accountType && accountType) {
        provider.accountType = accountType;
      }
      
      await provider.save();
      
      // Mark the review as completed for requester
      await User.findByIdAndUpdate(req.user.id, {
        needsReview: false
      });
      
    } else if (reviewFor === "requester" && swap.provider.toString() === req.user.id && hasOfferedItem) {
      // Provider reviewing requester (only allowed in item swap transactions)
      swap.requesterRating = validRating;
      swap.requesterReview = review;
      
      // Update requester's rating and trust score
      const requester = await User.findById(swap.requester);
      requester.rating = (requester.rating || 0) + validRating;
      requester.ratingCount = (requester.ratingCount || 0) + 1;
      
      // Calculate new trust score based on rating average and swap count
      const avgRating = requester.ratingCount > 0 ? requester.rating / requester.ratingCount : 0;
      const swapCount = (requester.itemsShared || 0) + (requester.itemsReceived || 0);
      
      // Same trust score formula
      const ratingComponent = (avgRating / 5) * 70;
      const swapComponent = Math.min(swapCount, 20) / 20 * 30;
      
      requester.trustScore = Math.round(ratingComponent + swapComponent);
      
      // IMPORTANT: Preserve the accountType to prevent validation error
      if (!requester.accountType && accountType) {
        requester.accountType = accountType;
      }
      
      await requester.save();
      
      // Mark the review as completed for provider
      await User.findByIdAndUpdate(req.user.id, {
        needsReview: false
      });
      
    } else {
      return res.status(400).json({
        success: false,
        message: hasOfferedItem ? 
          "Invalid review parameters" : 
          "Only the recipient can review the provider",
      });
    }

    await swap.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: swap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
};

// Add chat message to a swap
const addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Get the swap
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found",
      });
    }
    
    // Check if user is part of the swap
    if (swap.requester.toString() !== req.user.id && swap.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to message in this swap",
      });
    }
    
    // Check if swap is in a valid state for messaging
    if (swap.status !== "accepted" && swap.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only message in accepted or completed swaps",
      });
    }
    
    // Initialize messages array if it doesn't exist
    if (!swap.messages) {
      swap.messages = [];
    }
    
    // Add message
    const message = {
      sender: req.user.id,
      content,
      timestamp: Date.now(),
    };
    
    swap.messages.push(message);
    await swap.save();
    
    // Populate sender info for the response
    const populatedSwap = await Swap.findById(swap._id)
      .populate({
        path: "messages.sender",
        select: "firstName lastName profileImage",
      });
    
    // Get the newly added message
    const newMessage = populatedSwap.messages[populatedSwap.messages.length - 1];
    
    // Format the response
    const formattedMessage = {
      _id: newMessage._id,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      sender: {
        _id: newMessage.sender._id,
        fullName: `${newMessage.sender.firstName} ${newMessage.sender.lastName}`.trim(),
        profileImage: newMessage.sender.profileImage,
      },
    };
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: formattedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Get chat messages for a swap
const getMessages = async (req, res) => {
  try {
    // Get the swap
    const swap = await Swap.findById(req.params.id)
      .populate({
        path: "messages.sender",
        select: "firstName lastName profileImage",
      });
      
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found",
      });
    }
    
    // Check if user is part of the swap
    if (swap.requester.toString() !== req.user.id && swap.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view messages in this swap",
      });
    }
    
    // Format messages
    const messages = (swap.messages || []).map(msg => ({
      _id: msg._id,
      content: msg.content,
      timestamp: msg.timestamp,
      sender: {
        _id: msg.sender._id,
        fullName: `${msg.sender.firstName} ${msg.sender.lastName}`.trim(),
        profileImage: msg.sender.profileImage,
      },
    }));
    
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

module.exports = {
  getMySwaps,
  getPendingSwaps,
  getSingleSwap,
  createSwap,
  updateSwapStatus,
  reviewSwap,
  addMessage,
  getMessages
};
