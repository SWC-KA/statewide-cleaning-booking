const nodemailer = require("nodemailer");

async function run() {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "cmejia@statewidecleaning.com",
      pass: "YOUR_PASSWORD_HERE",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: true,
    },
  });

  console.log("Verifying SMTP...");
  await transporter.verify();
  console.log("SMTP verified.");

  console.log("Sending test email...");
  const info = await transporter.sendMail({
    from: '"Statewide Cleaning" <cmejia@statewidecleaning.com>',
    to: "drcris27@gmail.com",
    subject: "SMTP local test",
    text: "This is a local SMTP test.",
  });

  console.log("Sent:", info.response || info);
}

run().catch((err) => {
  console.error("SMTP test failed:");
  console.error(err);
});