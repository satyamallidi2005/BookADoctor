const notificationService = require('../services/notificationService');

/**
 * Get all notifications for the authenticated user.
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully.',
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all user notifications as read in bulk.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
