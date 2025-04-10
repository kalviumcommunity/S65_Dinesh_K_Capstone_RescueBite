const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema(
  {
    accountType: {
      type: String,
      enum: ["individual", "organization"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: function () {
        return this.accountType === "individual"
      },
    },
    businessName: {
      type: String,
      required: function () {
        return this.accountType === "organization"
      },
    },
    businessType: {
      type: String,
      required: function () {
        return this.accountType === "organization"
      },
    },
    businessAddress: {
      type: String,
      required: function () {
        return this.accountType === "organization"
      },
    },
    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    phone: {
      type: String,
      default: "",
    },
    trustScore: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    itemsShared: {
      type: Number,
      default: 0,
    },
    itemsReceived: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    settings: {
      privacy: {
        profileVisibility: {
          type: String,
          enum: ['public', 'contacts', 'private'],
          default: 'public'
        },
        locationPrecision: {
          type: String,
          enum: ['exact', 'neighborhood', 'city'],
          default: 'city'
        },
        showTrustScore: {
          type: Boolean,
          default: true
        },
        shareActivity: {
          type: Boolean,
          default: true
        }
      },
      notifications: {
        emailNotifications: {
          type: Boolean,
          default: true
        },
        pushNotifications: {
          type: Boolean,
          default: true
        },
        swapUpdates: {
          type: Boolean,
          default: true
        },
        marketingEmails: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  { timestamps: true },
)

// Create index for geospatial queries
UserSchema.index({ location: "2dsphere" })

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  if (this.accountType === "individual") {
    return `${this.firstName} ${this.lastName}`
  }
  return this.businessName
})

// Calculate average rating
UserSchema.methods.calculateRating = function () {
  if (this.ratingCount === 0) return 0
  return this.rating / this.ratingCount
}

module.exports = mongoose.model("User", UserSchema)

