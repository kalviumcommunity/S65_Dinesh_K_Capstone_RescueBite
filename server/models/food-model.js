const mongoose = require("mongoose")

const FoodItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    quantityUnit: {
      type: String,
      default: "servings",
    },
    category: {
      type: String,
      required: true,
      enum: ["meal", "produce", "bakery", "dairy", "pantry", "other"],
    },
    dietary: {
      vegetarian: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      glutenFree: { type: Boolean, default: false },
      nutFree: { type: Boolean, default: false },
      dairyFree: { type: Boolean, default: false },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    price: {
      type: Number,
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isPickupOnly: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "completed", "expired"],
      default: "available",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create index for geospatial queries
FoodItemSchema.index({ location: "2dsphere" })

// Create index for expiration date to easily find expired items
FoodItemSchema.index({ expiresAt: 1 })

// Virtual for time remaining until expiration
FoodItemSchema.virtual("timeRemaining").get(function () {
  const now = new Date()
  const diff = this.expiresAt - now

  // Return in milliseconds
  return diff > 0 ? diff : 0
})

// Virtual for discount percentage
FoodItemSchema.virtual("discountPercentage").get(function () {
  if (!this.originalPrice || this.originalPrice <= 0 || this.isFree) return 100

  const discount = ((this.originalPrice - this.price) / this.originalPrice) * 100
  return Math.round(discount)
})

module.exports = mongoose.model("FoodItem", FoodItemSchema)

