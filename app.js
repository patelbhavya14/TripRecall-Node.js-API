const express = require("express");
const app = express();
const cors = require("cors");

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
