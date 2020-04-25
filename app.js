const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// Connect Database
connectDB();

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// default route
app.get("/", async (req, res) => {
  return res.status(200).json({ msg: "TripRecall_API" });
});

// Define Routes
app.use("/", require("./routes/user"));
app.use("/", require("./routes/trip"));
app.use("/", require("./routes/wishlist"));
app.use("/", require("./routes/attraction"));
app.use("/", require("./routes/note"));

module.exports = app;
