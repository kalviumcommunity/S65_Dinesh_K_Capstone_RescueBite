const Donation = require("../models/donation-model");
const mongoose = require("mongoose");

const createDonation = async (req, res) => {
  try {
    const { donor, isAnonymous, amount, currency, paymentMethod, paymentId, frequency, message } = req.body;

    const donation = new Donation({
      donor,
      isAnonymous,
      amount,
      currency,
      paymentMethod,
      paymentId,
      frequency,
      message,
      status: "completed", 
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating donation",
      error: error.message,
    });
  }
};

const getAllDonations = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      });
    }

    const { page = 1, limit = 10, status, frequency } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (frequency) {
      query.frequency = frequency;
    }

    const donations = await Donation.find(query)
      .populate("donor", "firstName lastName businessName email")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        donations,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        currentPage: Number.parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: error.message,
    });
  }
};

const getUserDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, frequency } = req.query;

    const query = { donor: req.user.id };

    if (frequency) {
      query.frequency = frequency;
    }

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

    const total = await Donation.countDocuments(query);

    const totalAmount = await Donation.aggregate([
      { $match: { donor: mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        donations,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        currentPage: Number.parseInt(page),
        total,
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: error.message,
    });
  }
};

const getDonationStats = async (req, res) => {
  try {
    const totalAmount = await Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

    const totalDonors = await Donation.distinct("donor").length;

    const totalDonations = await Donation.countDocuments();

    const recurringDonations = await Donation.countDocuments({
      frequency: { $ne: "one-time" },
    });

    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
        totalDonors,
        totalDonations,
        recurringDonations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching donation statistics",
      error: error.message,
    });
  }
};

const createRazorpayDonation = async (req, res) => {
  try {
    const { 
      donor, 
      isAnonymous, 
      amount, 
      currency, 
      paymentMethod, 
      paymentId, 
      frequency, 
      message,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature 
    } = req.body;

    let donorId = donor;
    if (req.user && req.user.id) {
      donorId = req.user.id;
    }

    const donation = new Donation({
      donor: donorId,
      isAnonymous: isAnonymous || !donorId,
      amount,
      currency,
      paymentMethod,
      paymentId: razorpay_payment_id || paymentId,
      frequency,
      message,
      status: "completed",
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating donation",
      error: error.message,
    });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getUserDonations,
  getDonationStats,
  createRazorpayDonation
};
