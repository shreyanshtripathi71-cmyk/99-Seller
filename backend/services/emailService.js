const nodemailer = require('nodemailer');

const emailService = {
    /**
     * Send a password reset email
     * @param {string} email - Recipient email
     * @param {string} resetLink - The full reset link URL
     */
    sendPasswordResetEmail: async (email, resetLink) => {
        // Configure transporter inside the function to ensure it has latest process.env
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"99Sellers" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - 99Sellers',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                    <h2 style="color: #2563EB; margin-bottom: 20px;">99Sellers</h2>
                    <p>Hello,</p>
                    <p>You requested a password reset for your 99Sellers account. Click the button below to set a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #6B7280; font-size: 14px;">${resetLink}</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF;">This link will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return { success: true };
        } catch (error) {
            console.error('Email send error:', error);
            // Don't throw, just return failure so it can be handled
            return { success: false, error: error.message };
        }
    }
};

module.exports = emailService;
