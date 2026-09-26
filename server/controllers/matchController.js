const Item = require("../models/Item");
const Match = require("../models/Match");

// Get matches related to the logged-in student's items
const getMyMatches = async (req, res) => {
  try {
    const myItems = await Item.find({
      reportedBy: req.user._id,
    }).select("_id");

    const itemIds = myItems.map((item) => item._id);

    const matches = await Match.find({
      $or: [{ lostItem: { $in: itemIds } }, { foundItem: { $in: itemIds } }],
    })
      .populate({
        path: "lostItem",
        select:
          "itemName itemType location itemDate description details image reportedBy status",
        populate: {
          path: "reportedBy",
          select: "name collegeId contact",
        },
      })
      .populate({
        path: "foundItem",
        select:
          "itemName itemType location itemDate description details image reportedBy status",
        populate: {
          path: "reportedBy",
          select: "name collegeId contact",
        },
      })
      .sort({ createdAt: -1 });

    const userId = req.user._id.toString();

    const matchesWithRole = matches.map((match) => {
      const matchObject = match.toObject();

      matchObject.isLostStudent =
        match.lostItem?.reportedBy?._id?.toString() === userId;

      matchObject.isFoundStudent =
        match.foundItem?.reportedBy?._id?.toString() === userId;

      // Hide contact information until the return process starts.
      if (
        matchObject.status !== "ReturnInProgress" &&
        matchObject.status !== "Returned"
      ) {
        if (matchObject.lostItem?.reportedBy) {
          matchObject.lostItem.reportedBy = {
            _id: matchObject.lostItem.reportedBy._id,
          };
        }

        if (matchObject.foundItem?.reportedBy) {
          matchObject.foundItem.reportedBy = {
            _id: matchObject.foundItem.reportedBy._id,
          };
        }
      }

      return matchObject;
    });

    res.status(200).json(matchesWithRole);
  } catch (error) {
    console.error("Get my matches error:", error);

    res.status(500).json({
      message: "Failed to fetch matches",
      error: error.message,
    });
  }
};

// Get one specific match
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate(
        "lostItem",
        "itemName itemType location itemDate description details image reportedBy status",
      )
      .populate(
        "foundItem",
        "itemName itemType location itemDate description details image reportedBy status",
      );

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const userId = req.user._id.toString();

    const isOwner =
      match.lostItem.reportedBy.toString() === userId ||
      match.foundItem.reportedBy.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({
        message: "You are not authorized to view this match",
      });
    }

    res.status(200).json(match);
  } catch (error) {
    console.error("Get match error:", error);

    res.status(500).json({
      message: "Failed to fetch match",
      error: error.message,
    });
  }
};

// Accept or reject a possible match
const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid match status",
      });
    }

    const match = await Match.findById(req.params.id)
      .populate("lostItem", "_id reportedBy")
      .populate("foundItem", "_id reportedBy");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const userId = req.user._id.toString();

    const isLostStudent = match.lostItem.reportedBy.toString() === userId;

    if (!isLostStudent) {
      return res.status(403).json({
        message: "Only the lost-item student can respond to this match",
      });
    }

    if (match.status !== "Pending") {
      return res.status(400).json({
        message: "This match has already been processed",
      });
    }

    // A rejected match ends the process
    if (status === "Rejected") {
      match.status = "Rejected";

      await match.save();

      return res.status(200).json({
        message: "Match rejected successfully",
        match,
      });
    }

    // Accepting the match starts the return process
    if (status === "Accepted") {
      match.status = "ReturnInProgress";

      await match.save();

      // Mark both items as Matched
      await Item.findByIdAndUpdate(match.lostItem._id, {
        status: "Matched",
      });

      await Item.findByIdAndUpdate(match.foundItem._id, {
        status: "Matched",
      });

      return res.status(200).json({
        message: "Match accepted. Return process started.",
        match,
      });
    }
  } catch (error) {
    console.error("Update match status error:", error);

    res.status(500).json({
      message: "Failed to update match",
      error: error.message,
    });
  }
};

// Confirm that the found student handed over the item
const confirmHandover = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("lostItem", "_id reportedBy")
      .populate("foundItem", "_id reportedBy");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.status !== "ReturnInProgress") {
      return res.status(400).json({
        message: "Return process is not active",
      });
    }

    const userId = req.user._id.toString();

    // Only the student who found the item can confirm handover
    if (match.foundItem.reportedBy.toString() !== userId) {
      return res.status(403).json({
        message: "Only the found-item student can confirm handover",
      });
    }

    if (match.handoverConfirmedBy) {
      return res.status(400).json({
        message: "Handover is already confirmed",
      });
    }

    match.handoverConfirmedBy = req.user._id;
    match.handoverConfirmedAt = new Date();

    // If the lost student already confirmed receipt,
    // the return is complete.
    if (match.receiptConfirmedBy) {
      match.status = "Returned";

      await Item.findByIdAndUpdate(match.lostItem._id, {
        status: "Returned",
      });

      await Item.findByIdAndUpdate(match.foundItem._id, {
        status: "Returned",
      });
    }

    await match.save();

    res.status(200).json({
      message: "Handover confirmed successfully",
      match,
    });
  } catch (error) {
    console.error("Confirm handover error:", error);

    res.status(500).json({
      message: "Failed to confirm handover",
      error: error.message,
    });
  }
};

// Confirm that the lost student received the item
const confirmReceipt = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("lostItem", "_id reportedBy")
      .populate("foundItem", "_id reportedBy");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.status !== "ReturnInProgress") {
      return res.status(400).json({
        message: "Return process is not active",
      });
    }

    const userId = req.user._id.toString();

    // Only the student who lost the item can confirm receipt
    if (match.lostItem.reportedBy.toString() !== userId) {
      return res.status(403).json({
        message: "Only the lost-item student can confirm receipt",
      });
    }

    if (match.receiptConfirmedBy) {
      return res.status(400).json({
        message: "Receipt is already confirmed",
      });
    }

    match.receiptConfirmedBy = req.user._id;
    match.receiptConfirmedAt = new Date();

    // If the found student already confirmed handover,
    // the return is complete.
    if (match.handoverConfirmedBy) {
      match.status = "Returned";

      await Item.findByIdAndUpdate(match.lostItem._id, {
        status: "Returned",
      });

      await Item.findByIdAndUpdate(match.foundItem._id, {
        status: "Returned",
      });
    }

    await match.save();

    res.status(200).json({
      message: "Receipt confirmed successfully",
      match,
    });
  } catch (error) {
    console.error("Confirm receipt error:", error);

    res.status(500).json({
      message: "Failed to confirm receipt",
      error: error.message,
    });
  }
};

module.exports = {
  getMyMatches,
  getMatchById,
  updateMatchStatus,
  confirmHandover,
  confirmReceipt,
};
