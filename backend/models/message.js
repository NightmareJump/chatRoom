// backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
  },
  { timestamps: true }  // 自动添加 createdAt, updatedAt
);

module.exports = mongoose.model('Message', MessageSchema);
