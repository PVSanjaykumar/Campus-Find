// Create a new lost/found item
const Item = require("../models/Item");

const cloudinary = require("../config/cloudinary");
const createItem = async (req, res) => {
  try {
    const { itemType, itemName, location, itemDate, description, details } =
      req.body;

    if (!itemType || !itemName || !location || !itemDate) {
      return res.status(400).json({
        message: "Item type, item name, location and date are required",
      });
    }

    let image = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "campusfind",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(req.file.buffer);
      });

      image = result.secure_url;
    }

    const parsedDetails =
      typeof details === "string" ? JSON.parse(details) : details || {};

    const item = await Item.create({
      itemType,
      itemName,
      location,
      itemDate,
      description: description || "",
      details: parsedDetails,
      image,
      reportedBy: req.user._id,
    });

    res.status(201).json({
      message: "Item reported successfully",
      item,
    });
  } catch (error) {
    console.error("Create item error:", error);

    res.status(500).json({
      message: "Failed to report item",
      error: error.message,
    });
  }
};

// Get all approved items
const getItems = async (req, res) => {
  try {
    const items = await Item.find({
      status: "Approved",
    })
      .populate("reportedBy", "name collegeId")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message,
    });
  }
};

// Get single item
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name collegeId",
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch item",
      error: error.message,
    });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({
      reportedBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your items",
      error: error.message,
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  getMyItems,
};
