const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message content is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['appointment', 'report', 'general'],
        message: 'Notification type must be appointment, report, or general',
      },
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
