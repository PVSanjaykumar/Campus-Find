const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
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
      sender: {
        name: "Campus Lost & Found",
        email: "rkvlostfound@gmail.com",
      },

      to: [
        {
          email: recipient.email,
          name: recipient.name,
        },
      ],

      subject,

      htmlContent: `
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

  try {
    // Email to the person who reported the Lost item
    const lostEmail = await brevo.transactionalEmails.sendTransacEmail(
      createEmail(lostUser, lostItem, foundItem)
    );

    console.log("Lost-item email sent:", lostEmail.messageId);

    // Email to the person who reported the Found item
    const foundEmail = await brevo.transactionalEmails.sendTransacEmail(
      createEmail(foundUser, foundItem, lostItem)
    );

    console.log("Found-item email sent:", foundEmail.messageId);

  } catch (error) {
    console.error("Brevo email error:", error);
  }
};

module.exports = {
  sendMatchNotification,
};