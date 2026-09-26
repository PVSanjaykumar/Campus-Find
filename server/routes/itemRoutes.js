const express = require("express");

const {
  createItem,
  getItems,
  getItemById,
  getMyItems,
} = require("../controllers/itemController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Create Lost/Found item
router.post("/", protect, upload.single("image"), createItem);

// Get approved items
router.get("/", getItems);

router.get("/my", protect, getMyItems);

// Get single item
router.get("/:id", getItemById);

module.exports = router;
