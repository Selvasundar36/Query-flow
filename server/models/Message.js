const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },
    user: { type: String, required: true },
    text: { type: String, default: "" },

   

    replyTo: {
      user: String,
      text: String,
    },

    fileUrl: String,
    fileType: {
      type: String,
      enum: ["image", "video", "audio", null],
      default: null,
    },

    edited: { type: Boolean, default: false },
    likedBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);



























































