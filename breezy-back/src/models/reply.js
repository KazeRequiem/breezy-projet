const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    reply: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    warn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reply", replySchema);