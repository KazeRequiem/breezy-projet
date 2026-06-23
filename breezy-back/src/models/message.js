const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 280 },
    image_url: { type: String, default: null },
    video_url: { type: String, default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    warn: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);