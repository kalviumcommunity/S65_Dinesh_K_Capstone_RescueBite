const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const swapSchema = new Schema({
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodItem: {
        type: Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true
    },
    offeredItem: {
        type: Schema.Types.ObjectId,
        ref: 'FoodItem'
    },
    message: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    isSwap: {
        type: Boolean,
        default: false
    },
    isPurchase: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        default: 0
    },
    requesterRating: {
        type: Number,
        default: 0
    },
    providerRating: {
        type: Number,
        default: 0
    },
    requesterReview: {
        type: String
    },
    providerReview: {
        type: String
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Swap', swapSchema);