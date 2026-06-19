const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, maxlength: 255 },
    password: { type: String, required: true },
    biography: { type: String, maxlength: 160, default: null },
    profile_picture: { type: String, default: null },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    tags: { type: [String], default: [] },
  },
  { timestamps: true } // crée automatiquement createdAt et updatedAt
);

module.exports = mongoose.model("User", userSchema);