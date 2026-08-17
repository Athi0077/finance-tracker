const notificationService = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const { unread } = req.query;
    const unreadOnly = unread === 'true';
    const data = await notificationService.getNotifications(req.user._id, unreadOnly);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAsRead(req.user._id, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const response = await notificationService.markAllAsRead(req.user._id);
    res.status(200).json({ success: true, message: response.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
