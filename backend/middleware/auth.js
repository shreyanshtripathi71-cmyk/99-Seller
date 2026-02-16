const jwt = require('jsonwebtoken');
const { UserLogin } = require('../models');

/**
 * Auth Middleware
 * Verifies JWT token and attaches user to request
 */
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await UserLogin.findByPk(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

/**
 * Role-based middleware
 * Checks if user has required role
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.UserType)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.UserType} is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Optional Auth Middleware
 * If token is present, verifies it and attaches user.
 * If no token or invalid, simply proceeds without req.user.
 */
exports.optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserLogin.findByPk(decoded.id);
        next();
    } catch (err) {
        // Token invalid or expired - proceed as guest
        next();
    }
};
