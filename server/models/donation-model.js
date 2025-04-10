const mongoose = require("mongoose")

const DonationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer", "other"],
      required: true,
    },
    paymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    frequency: {
      type: String,
      enum: ["one-time", "monthly", "quarterly", "yearly"],
      default: "one-time",
    },
    message: {
      type: String,
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

module.exports = mongoose.model("Donation", DonationSchema)

