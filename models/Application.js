const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    address: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    proofOfWork: { type: String, required: true },
    credentials: { type: String },
    status: { type: String, default: 'pending' }
});

// Prevent overwriting the model
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

// Export the model
module.exports = Application;