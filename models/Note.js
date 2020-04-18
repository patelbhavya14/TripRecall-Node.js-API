const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    attraction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attractions",
    },
    detail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = Note = mongoose.model("note", NoteSchema);
