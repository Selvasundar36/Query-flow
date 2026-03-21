const mongoose = require("mongoose");

const primeUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  rooms: [String],                                    // rooms where he is prime user
  lastSeenAt: { type: Date, default: null }              // for activity tracking
});

module.exports = mongoose.model("PrimeUser", primeUserSchema);
