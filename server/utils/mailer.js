// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.SMTP_MAIL,
//     pass: process.env.SMTP_PASS
//   },
//    tls: {
//     rejectUnauthorized: false   //for localhost project
     
//   }
// });

// module.exports = async function sendReportMail(to, subject, html) {
//   await transporter.sendMail({
//     from: `"QueryFlow" <${process.env.SMTP_MAIL}>`,
//     to,
//     subject,
//     html
//   });
// };

// with out smtp

const nodemailer = require("nodemailer");

async function sendReportMail(to, subject, html) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Chatroom" <chatroomreport123@gmail.com>',
    to,
    subject,
    html,
  });

  console.log("📧 Mail sent");
  console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
}

module.exports = sendReportMail;


// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_KEY);

// module.exports = async function sendReportMail(to, subject, html) {
//   await sgMail.send({
//     to,
//     from: "chatroomreport123@gmail.com",
//     subject,
//     html,
//   });
// };
