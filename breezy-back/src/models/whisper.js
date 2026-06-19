const mongoose = require("mongoose");

const whisperSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 280 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    warn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Whisper", whisperSchema);