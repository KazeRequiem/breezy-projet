const mongoose = require("mongoose");
const { MOODS, DEFAULT_MOOD } = require("../utils/moods");

const whisperSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 280 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    warn: { type: Number, default: 0 },
    mood: { type: String, enum: MOODS, default: DEFAULT_MOOD },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Whisper", whisperSchema);