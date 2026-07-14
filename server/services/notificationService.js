const Notification = require('../models/Notification');

/**
 * Retrieves all notifications for the logged-in receiver.
 */
const getUserNotifications = async (receiverId) => {
  return await Notification.find({ receiverId })
    .sort({ createdAt: -1 });
};

/**
 * Marks a single notification as read.
 */
const markAsRead = async (receiverId, id) => {
  const notification = await Notification.findOne({ _id: id, receiverId });
  if (!notification) {
    throw new Error('Notification not found.');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

/**
 * Marks all unread notifications for a receiver as read.
 */
const markAllAsRead = async (receiverId) => {
  await Notification.updateMany(
    { receiverId, isRead: false },
    { $set: { isRead: true } }
  );
  return { success: true };
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
