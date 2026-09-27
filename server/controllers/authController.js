const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});
// Register
const registerUser = async (req, res) => {
  try {
    const { name, collegeId, email, contact, password } = req.body;

    // Check required fields
    if (!name || !collegeId || !email || !contact || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check whether user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { collegeId }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or college ID already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      collegeId,
      email,
      contact,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        collegeId: user.collegeId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        collegeId: user.collegeId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "student",
    });

    /*
      We return the same message whether the email exists
      or not. This prevents people from discovering which
      emails have registered accounts.
    */
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store token in database
    user.resetPasswordToken = resetToken;

    // Token expires after 15 minutes
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create email transporter
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Campus Lost & Found",
        email: "rkvlostfound@gmail.com",
      },

      to: [
        {
          email: user.email,
          name: user.name,
        },
      ],

      subject: "Reset Your Campus Lost & Found Password",

      htmlContent: `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      padding: 25px;
    ">

      <h2 style="color: #2563eb;">
        🎓 Campus Lost & Found
      </h2>

      <h3>Password Reset Request</h3>

      <p>
        Hello <strong>${user.name}</strong>,
      </p>

      <p>
        We received a request to reset the password
        for your Campus Lost & Found account.
      </p>

      <p>
        Click the button below to create a new password.
      </p>

      <div style="margin: 30px 0;">
        <a
          href="${resetUrl}"
          style="
            background: #2563eb;
            color: white;
            padding: 12px 22px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
          "
        >
          Reset Password
        </a>
      </div>

      <p>
        This link will expire in
        <strong>15 minutes</strong>.
      </p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>

      <p style="color: #64748b;">
        This is an automated email from Campus Lost & Found.
      </p>

    </div>
  `,
    });

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Failed to process password reset request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: new Date(),
      },
      role: "student",
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);

    // Remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Failed to reset password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
