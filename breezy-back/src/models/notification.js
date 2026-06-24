const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["follow", "like", "mention", "reply", "whisper"],
            required: true,
        },
        message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
        // lue ou non
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);