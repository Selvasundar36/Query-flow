const Question = require("../models/Question");

async function getTodayQuestionCount(room) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return await Question.countDocuments({
    room,
    createdAt: { $gte: start }
  });
}

module.exports = getTodayQuestionCount;
