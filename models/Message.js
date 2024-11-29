const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  username: {type: String, required: true}
});

module.exports = mongoose.model('Message', MessageSchema);