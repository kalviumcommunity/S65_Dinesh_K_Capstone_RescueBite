const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Individual","Organization"],
        required: true
    },
    trustScore: {
         type: Number,
         default: 0
     },
    swapHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
},{timestamps: true})

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

module.exports = mongoose.model("User", UserSchema);