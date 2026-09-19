const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    required_skills: { type: String },
    location: { type: String, required: true },
    job_type: { type: String, required: true },
    salary: { type: String },
    status: { type: String, default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);