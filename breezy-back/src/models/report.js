const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, message: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);