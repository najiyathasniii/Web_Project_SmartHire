const mongoose = require('mongoose');

const seekerProfileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    skills: {
        type: String
    },
    education: {
        type: String
    },
    experience: {
        type: String
    },
    bio: {
        type: String
    },
    contact_number: {
        type: String
    },
    github_url: {
        type: String
    },
    linkedin_url: {
        type: String
    },
    is_student: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('SeekerProfile', seekerProfileSchema);