const { UserLogin, FreeUser } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const activityService = require('../services/activityService');
const emailService = require('../services/emailService');

console.log('Auth Controller initialized');

// Helper to verify captcha
const verifyCaptcha = async (token) => {
    if (process.env.ENABLE_RECAPTCHA === 'false' || process.env.NODE_ENV === 'test') {
        console.log('[DEBUG] reCAPTCHA disabled by config');
        return true;
    }

    // Developer bypass token
    if (token === 'SKIP_CAPTCHA') {
        console.warn('[SECURITY] reCAPTCHA bypassed via token');
        return true;
    }

    if (!token) {
        console.log('[DEBUG] reCAPTCHA token missing');
        return false;
    }

    try {
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        if (!secret) {
            console.warn('RECAPTCHA_SECRET_KEY not set. Skipping verification.');
            return true;
        }

        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
        );

        if (!response.data.success) {
            console.error('reCAPTCHA verification failed. Google returned:', response.data);
        }

        return response.data.success;
    } catch (error) {
        console.error('Captcha verification failed:', error.message);
        return false;
    }
};

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, firstName, lastName, captchaToken } = req.body;

            // Verify Captcha
            const isCaptchaValid = await verifyCaptcha(captchaToken);
            if (!isCaptchaValid) {
                return res.status(400).json({ error: 'Captcha verification failed. Please try again.' });
            }

            const existingUser = await UserLogin.findOne({ where: { Email: email } });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await UserLogin.create({
                Username: email,
                Email: email,
                Password: hashedPassword,
                FirstName: firstName,
                LastName: lastName,
                UserType: 'free' // Default to free member
            });

            // Create free user detail record
            await FreeUser.create({
                Username: email
            });

            try {
                await activityService.logActivity('user', `New user registered: ${email}`);
            } catch (logError) {
                console.error('Failed to log registration activity:', logError);
            }

            res.status(201).json({ success: true, message: 'Registration successful' });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password, captchaToken } = req.body;

            // Verify Captcha
            const isCaptchaValid = await verifyCaptcha(captchaToken);
            if (!isCaptchaValid) {
                return res.status(400).json({ error: 'Captcha verification failed. Please try again.' });
            }

            const user = await UserLogin.findOne({ where: { Email: email } });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.Username, userType: user.UserType },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );

            try {
                await activityService.logActivity('login', `User logged in: ${user.Email}`);
            } catch (logError) {
                console.error('Failed to log login activity:', logError);
            }

            res.json({
                success: true,
                token,
                userType: user.UserType,
                user: {
                    email: user.Email,
                    firstName: user.FirstName,
                    lastName: user.LastName
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { firstName, lastName, phone, address, city, state, pin } = req.body;
            const username = req.user.Username;

            const user = await UserLogin.findByPk(username);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            // Update fields
            await user.update({
                FirstName: firstName || user.FirstName,
                LastName: lastName || user.LastName,
                Contact: phone || user.Contact,
                Address: address || user.Address,
                City: city || user.City,
                State: state || user.State,
                Pin: pin || user.Pin
            });

            try {
                await activityService.logActivity('user', `User updated profile: ${user.Email}`);
            } catch (logError) {
                console.error('Failed to log update activity:', logError);
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user.Username,
                    email: user.Email,
                    firstName: user.FirstName,
                    lastName: user.LastName,
                    phone: user.Contact,
                    address: user.Address,
                    city: user.City,
                    state: user.State,
                    pin: user.Pin,
                    userType: user.UserType
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ success: false, error: 'Failed to update profile' });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const username = req.user.Username;

            const user = await UserLogin.findByPk(username);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            // Check current password
            const isMatch = await bcrypt.compare(currentPassword, user.Password);
            if (!isMatch) {
                return res.status(400).json({ success: false, error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await user.update({ Password: hashedNewPassword });

            try {
                await activityService.logActivity('user', `User changed password: ${user.Email}`);
            } catch (logError) {
                console.error('Failed to log password change activity:', logError);
            }

            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ success: false, error: 'Failed to change password' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await UserLogin.findOne({ where: { Email: email } });

            if (!user) {
                // For security, don't reveal if user exists
                return res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });
            }

            // Generate token (simple random string for now)
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const expires = new Date(Date.now() + 600000); // 10 minutes

            await user.update({
                ResetToken: token,
                ResetTokenExpires: expires
            });

            // LOG TO CONSOLE since no email service
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
            console.log('\n=======================================');
            console.log('PASSWORD RESET REQUESTED');
            console.log('Email:', email);
            console.log('Reset Link:', resetUrl);
            console.log('=======================================\n');

            // Send real email if configured
            console.log('Checking email config...');
            console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Configured' : 'MISSING');
            console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configured' : 'MISSING');

            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                console.log('Attempting to send real email to:', email);
                const emailResult = await emailService.sendPasswordResetEmail(email, resetUrl);
                if (!emailResult.success) {
                    console.error('Failed to send real email:', emailResult.error);
                } else {
                    console.log('Real email sent successfully!');
                }
            } else {
                console.warn('Email not sent: SMTP credentials missing in process.env');
            }

            res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ success: false, error: 'Failed to process request' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, password } = req.body;
            const { Op } = require('sequelize');

            const user = await UserLogin.findOne({
                where: {
                    ResetToken: token,
                    ResetTokenExpires: { [Op.gt]: new Date() }
                }
            });

            if (!user) {
                return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await user.update({
                Password: hashedPassword,
                ResetToken: null,
                ResetTokenExpires: null
            });

            res.json({ success: true, message: 'Password has been reset successfully' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ success: false, error: 'Failed to reset password' });
        }
    }
};

module.exports = authController;
