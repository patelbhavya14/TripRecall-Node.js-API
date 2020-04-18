const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    trip_name: {
      type: String,
      required: true,
    },
    place_id: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    attractions: [{ type: mongoose.Schema.Types.ObjectId, ref: "attraction" }],
  },
  {
    timestamps: { createdAt: "created_ts", updatedAt: "updated_ts" },
  }
);

module.exports = Trip = mongoose.model("trip", TripSchema);
