const mongoose = require("mongoose");

const categorizeSchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    tag: { type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: true },
  },
  { timestamps: true }
);

categorizeSchema.index({ message: 1, tag: 1 }, { unique: true });

module.exports = mongoose.model("Categorize", categorizeSchema);