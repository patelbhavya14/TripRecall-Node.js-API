const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trips",
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_ts", updatedAt: "updated_ts" },
  }
);

module.exports = Photo = mongoose.model("photo", PhotoSchema);
