const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    // Match/return process status
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "ReturnInProgress",
        "Returned",
      ],
      default: "Pending",
    },

    // Student who found the item confirms that they handed it over
    handoverConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    handoverConfirmedAt: {
      type: Date,
      default: null,
    },

    // Student who lost the item confirms that they received it
    receiptConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    receiptConfirmedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Match", matchSchema);