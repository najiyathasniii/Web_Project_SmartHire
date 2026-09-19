const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
    seeker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SavedJob', savedJobSchema);