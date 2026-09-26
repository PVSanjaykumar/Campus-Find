const express = require("express");

const {
  getMyMatches,
  getMatchById,
  updateMatchStatus,
  confirmHandover,
  confirmReceipt,
} = require("../controllers/matchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, getMyMatches);

router.get("/:id", protect, getMatchById);

router.put("/:id/status", protect, updateMatchStatus);

// Return process
router.put("/:id/handover", protect, confirmHandover);

router.put("/:id/receipt", protect, confirmReceipt);

module.exports = router;
