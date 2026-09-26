const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMatchNotification = async ({
  lostUser,
  foundUser,
  lostItem,
  foundItem,
  score,
}) => {
  const subject = "Possible Lost & Found Match Detected";

  const createEmail = (recipient, userItem, matchedItem) => {
    return {
      from: `"Campus Lost & Found" <${process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 650px;
          margin: auto;
          padding: 25px;
          color: #1f2937;
        ">

          <h2 style="color: #2563eb;">
            🎓 Campus Lost & Found
          </h2>

          <h3>
            Possible Match Found!
          </h3>

          <p>
            Hello <strong>${recipient.name}</strong>,
          </p>

          <p>
            Our system found a possible match for the item
            you reported.
          </p>

          <div style="
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          ">

            <h3>Your Report</h3>

            <p>
              <strong>Item:</strong>
              ${userItem.itemName}
            </p>

            <p>
              <strong>Type:</strong>
              ${userItem.itemType}
            </p>

            <p>
              <strong>Location:</strong>
              ${userItem.location}
            </p>

          </div>

          <div style="
            background: #eff6ff;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          ">

            <h3>Possible Matching Report</h3>

            <p>
              <strong>Item:</strong>
              ${matchedItem.itemName}
            </p>

            <p>
              <strong>Type:</strong>
              ${matchedItem.itemType}
            </p>

            <p>
              <strong>Location:</strong>
              ${matchedItem.location}
            </p>

            <p>
              <strong>Match Score:</strong>
              ${score}%
            </p>

          </div>

          <p>
            Please log in to your Campus Lost & Found account
            to review this possible match.
          </p>

          <p style="color: #64748b;">
            This is an automated notification from Campus
            Lost & Found.
          </p>

        </div>
      `,
    };
  };

  // Email to the person who reported the Lost item
  await transporter.sendMail(createEmail(lostUser, lostItem, foundItem));

  // Email to the person who reported the Found item
  await transporter.sendMail(createEmail(foundUser, foundItem, lostItem));
};

module.exports = {
  sendMatchNotification,
};
