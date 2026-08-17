const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

/**
 * Get all notifications for a user
 */
const getNotifications = async (userId, unreadOnly = false) => {
  const query = { userId };
  if (unreadOnly) {
    query.isRead = false;
  }
  return await Notification.find(query).sort({ createdAt: -1 });
};

/**
 * Create a new notification (used internally by cron or engine)
 */
const createNotification = async (userId, title, message, type = 'info') => {
  return await Notification.create({
    userId,
    title,
    message,
    type,
    isRead: false
  });
};

/**
 * Mark a notification as read
 */
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) throw new ApiError(404, 'Notification not found');
  
  notification.isRead = true;
  await notification.save();
  return notification;
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { message: 'All notifications marked as read' };
};

module.exports = { 
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead
};
