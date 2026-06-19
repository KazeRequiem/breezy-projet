const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 280 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);