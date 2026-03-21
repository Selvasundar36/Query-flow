const cron = require("node-cron");
const PrimeUser = require("../models/PrimeUser");
const Question = require("../models/Question");
const sendMail = require("../utils/mailer");

cron.schedule("30 15 * * *", async () => {
  console.log(" Prime User Report Running");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const primes = await PrimeUser.find();

  for (const prime of primes) {
    for (const room of prime.rooms) {
      const count = await Question.countDocuments({
        room,
        createdAt: { $gte: today }
      });

      if (count > 0) {
        await sendMail(
          prime.email,
          `chatroom's toady question in ${room} room report`,
          `You have ${count} unanswered questions in ${room}`
        );
      }
    }
  }
});
