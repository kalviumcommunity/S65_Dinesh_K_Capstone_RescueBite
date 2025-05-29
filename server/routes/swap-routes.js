const express = require("express");
const swapController = require("../controllers/swap-controller");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/my-swaps", auth, swapController.getMySwaps);
router.get("/pending", auth, swapController.getPendingSwaps);
router.get("/:id", auth, swapController.getSingleSwap);
router.get("/:id/messages", auth, swapController.getMessages);


router.post("/", auth, swapController.createSwap);
router.put("/:id/status", auth, swapController.updateSwapStatus);
router.put("/:id/review", auth, swapController.reviewSwap);
router.post("/:id/messages", auth, swapController.addMessage);

module.exports = router;
