const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const adminRoutes = require("./routes/adminRoutes");

const matchRoutes = require("./routes/matchRoutes");




const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/items", itemRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/matches", matchRoutes);

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Campus Lost & Found API is running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});