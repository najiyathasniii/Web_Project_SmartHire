const SeekerProfile = require('../models/SeekerProfile');
const EmployerProfile = require('../models/EmployerProfile');

// Get Profile (For both Seeker and Employer)
const getProfile = async (req, res) => {
    try {
        if (req.user.role === 'seeker') {
            const profile = await SeekerProfile.findOne({ user_id: req.user.userId });
            if (!profile) return res.status(404).json({ message: 'Seeker profile not found' });
            return res.json(profile);
        } else if (req.user.role === 'employer') {
            const profile = await EmployerProfile.findOne({ user_id: req.user.userId });
            if (!profile) return res.status(404).json({ message: 'Employer profile not found' });
            return res.json(profile);
        } else {
            return res.status(400).json({ message: 'Invalid user role' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update or Create Seeker Profile
const updateSeekerProfile = async (req, res) => {
    try {
        const { full_name, skills, education, experience, bio, contact_number, github_url, linkedin_url, is_student } = req.body;

        const updatedProfile = await SeekerProfile.findOneAndUpdate(
            { user_id: req.user.userId },
            { full_name, skills, education, experience, bio, contact_number, github_url, linkedin_url, is_student },
            { new: true, upsert: true }
        );

        res.json({ message: 'Seeker profile updated successfully!', updatedProfile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update or Create Employer Profile
const updateEmployerProfile = async (req, res) => {
    try {
        const { company_name, whatsapp_number, description } = req.body;

        const updatedProfile = await EmployerProfile.findOneAndUpdate(
            { user_id: req.user.userId },
            { company_name, whatsapp_number, description },
            { new: true, upsert: true }
        );

        res.json({ message: 'Employer profile updated successfully!', updatedProfile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getProfile, updateSeekerProfile, updateEmployerProfile };