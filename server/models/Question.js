const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,  
      ref: "Message",
      required: true,
    },

    text: { type: String, required: true },
    user: { type: String, required: true },
     createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
  
);
QuestionSchema.index({ room: 1, text: 1 }, { unique: true });

module.exports = mongoose.model("Question", QuestionSchema);
