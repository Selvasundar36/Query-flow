const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  room: String,
  role: {
    type: String,
    enum: ["user", "prime", "admin"],
    default: "user",
  },
  picture: String,
  email: String,
  googleId: String,
});

module.exports = mongoose.model("User", userSchema);
