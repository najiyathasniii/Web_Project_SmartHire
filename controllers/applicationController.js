const Application = require('../models/Application');
const Job = require('../models/Job');

// Apply for a job
const applyForJob = async (req, res) => {
    try {
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Only job seekers can apply for jobs' });
        }

        const jobId = req.params.jobId;
        const seekerId = req.user.userId;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({ job_id: jobId, seeker_id: seekerId });
        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        const newApplication = new Application({
            job_id: jobId,
            seeker_id: seekerId,
            status: 'pending'
        });

        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully!', newApplication });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get applications for a seeker or employer
const getApplications = async (req, res) => {
    try {
        let applications;
        if (req.user.role === 'seeker') {
            applications = await Application.find({ seeker_id: req.user.userId }).populate('job_id');
        } else {
            // For employers, find applications for their posted jobs
            const jobs = await Job.find({ employer_id: req.user.userId });
            const jobIds = jobs.map(job => job._id);
            applications = await Application.find({ job_id: { $in: jobIds } }).populate('job_id seeker_id');
        }
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { applyForJob, getApplications };