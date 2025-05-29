const express = require("express");
const donationController = require("../controllers/donation-controller");
const auth = require("../middlewares/auth");
const router = express.Router();

router.post("/", donationController.createDonation);
router.post("/razorpay", donationController.createRazorpayDonation);
router.get("/", auth, donationController.getAllDonations);
router.get("/my-donations", auth, donationController.getUserDonations);
router.get("/stats", donationController.getDonationStats);

module.exports = router;
