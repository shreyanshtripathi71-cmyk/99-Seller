const { AdminActivity } = require('../models');

if (!AdminActivity) {
    console.error('CRITICAL: AdminActivity model not found in activityService!');
} else {
    console.log('activityService: AdminActivity model loaded successfully.');
}

/**
 * Log Dashboard Activity
 * @param {string} type - Activity type (user, subscription, property, login, system, crawler)
 * @param {string} message - Description of the activity
 * @param {object} details - Additional details in JSON format
 */
exports.logActivity = async (type, message, details = {}) => {
    try {
        await AdminActivity.create({ type, message, details });
    } catch (err) {
        console.error('Error logging activity:', err);
    }
};
