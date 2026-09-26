const express = require("express");

const {
  getPendingItems,
  approveItem,
  rejectItem,
  getReturnMatches

} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all pending items
router.get("/items", protect, admin, getPendingItems);

router.get("/returns", protect, admin, getReturnMatches);

// Approve an item
router.put("/items/:id/approve", protect, admin, approveItem);

// Reject an item
router.put("/items/:id/reject", protect, admin, rejectItem);

module.exports = router;