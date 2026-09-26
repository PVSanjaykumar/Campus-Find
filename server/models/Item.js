const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["Lost", "Found"],
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
    },

    itemDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    details: {
      company: {
        type: String,
        default: "",
      },

      color: {
        type: String,
        default: "",
      },

      cash: {
        type: Number,
        default: null,
      },

      idName: {
        type: String,
        default: "",
      },

      keyType: {
        type: String,
        default: "",
      },
    },

    image: {
      type: String,
      default: "",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Matched", "Returned"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Item", itemSchema);
