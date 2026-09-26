const Item = require("../models/Item");
const Match = require("../models/Match");

const { findMatchesForItem } = require("../services/matchingService");
// Get all pending items
const getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({
      status: "Pending",
    })
      .populate("reportedBy", "name collegeId email contact")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending items",
      error: error.message,
    });
  }
};

// Approve an item
const approveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending items can be approved",
      });
    }

    // Approve the item first
    item.status = "Approved";
    await item.save();

    // Run the matching service
    const matches = await findMatchesForItem(item);

    res.status(200).json({
      message: "Item approved successfully",
      item,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve item",
      error: error.message,
    });
  }
};
// Reject an item
const rejectItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    item.status = "Rejected";

    await item.save();

    res.status(200).json({
      message: "Item rejected successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject item",
      error: error.message,
    });
  }
};

const getReturnMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate({
        path: "lostItem",
        select: "itemName itemType location itemDate image reportedBy status",
        populate: {
          path: "reportedBy",
          select: "name collegeId contact",
        },
      })
      .populate({
        path: "foundItem",
        select: "itemName itemType location itemDate image reportedBy status",
        populate: {
          path: "reportedBy",
          select: "name collegeId contact",
        },
      })
      .populate({
        path: "handoverConfirmedBy",
        select: "name collegeId contact",
      })
      .populate({
        path: "receiptConfirmedBy",
        select: "name collegeId contact",
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(matches);
  } catch (error) {
    console.error("Get return matches error:", error);

    res.status(500).json({
      message: "Failed to fetch return matches",
      error: error.message,
    });
  }
};

module.exports = {
  getPendingItems,
  approveItem,
  rejectItem,
  getReturnMatches,
};
