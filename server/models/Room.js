const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({

      name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    
  },
  primeUsers: {
    type: [String], // store usernames
    default: [],
  },
});

module.exports = mongoose.model("Room", roomSchema);
