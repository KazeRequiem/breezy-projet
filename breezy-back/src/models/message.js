const mongoose = require("mongoose");
const { MOODS, DEFAULT_MOOD } = require("../utils/moods");

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 280 },
    image_url: { type: String, default: null },
    video_url: { type: String, default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    warn: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    mood: { type: String, enum: MOODS, default: DEFAULT_MOOD },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);