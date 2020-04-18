const mongoose = require("mongoose");

const AttractionSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trips",
    },
    place_id: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    start_time: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notes",
    },
    transport: {
      mode: {
        type: String,
        enum: ["car", "public-transit", "walk", "plane"],
      },
      time: {
        type: Number,
      },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = Attraction = mongoose.model("attraction", AttractionSchema);
