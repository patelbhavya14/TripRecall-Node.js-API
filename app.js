const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Define Routes
app.use("/", require("./routes/user"));
app.use("/", require("./routes/trip"));

module.exports = app;
