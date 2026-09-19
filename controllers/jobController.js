const Job = require('../models/Job');
const Application = require('../models/Application');
const EmployerProfile = require('../models/EmployerProfile');
const SeekerProfile = require('../models/SeekerProfile');

// --- CREATE A NEW JOB POSTING ---
const createJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can post jobs' });
        }

        const userId = req.user.userId;
        const { title, description, job_type, required_skills, location, salary } = req.body;

        const employer = await EmployerProfile.findOne({ user_id: userId });
        if (!employer) {
            return res.status(404).json({ message: 'Employer profile not found. Please create one first.' });
        }

        const newJob = new Job({
            employer_id: userId,
            title,
            description,
            job_type,
            required_skills,
            location,
            salary,
            status: 'open'
        });

        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully!', jobId: newJob._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error posting job' });
    }
};

// --- GET ALL JOBS ---
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 }).lean();
        
        const jobsWithCompany = await Promise.all(jobs.map(async (job) => {
            const empProfile = await EmployerProfile.findOne({ user_id: job.employer_id });
            return {
                ...job,
                company_name: empProfile ? empProfile.company_name : 'Unknown',
                whatsapp_number: empProfile ? empProfile.whatsapp_number : ''
            };
        }));

        res.status(200).json(jobsWithCompany);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching jobs' });
    }
};

// --- GET A SINGLE JOB BY ID ---
const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).lean();

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const empProfile = await EmployerProfile.findOne({ user_id: job.employer_id });
        const jobDetails = {
            ...job,
            company_name: empProfile ? empProfile.company_name : 'Unknown',
            whatsapp_number: empProfile ? empProfile.whatsapp_number : ''
        };

        res.status(200).json(jobDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching job details' });
    }
};

// --- GET EMPLOYER DASHBOARD DATA ---
const getEmployerDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const jobs = await Job.find({ employer_id: userId }).sort({ createdAt: -1 }).lean();
        const jobIds = jobs.map(j => j._id);

        const applications = await Application.find({ job_id: { $in: jobIds } }).lean();

        const formattedApps = await Promise.all(applications.map(async (app) => {
            const seekerProfile = await SeekerProfile.findOne({ user_id: app.seeker_id });
            return {
                application_id: app._id,
                job_id: app.job_id,
                status: app.status,
                full_name: seekerProfile ? seekerProfile.full_name : 'Unknown',
                skills: seekerProfile ? seekerProfile.skills : '',
                contact_number: seekerProfile ? seekerProfile.contact_number : '',
                linkedin_url: seekerProfile ? seekerProfile.linkedin_url : '',
                github_url: seekerProfile ? seekerProfile.github_url : ''
            };
        }));

        const dashboardData = jobs.map(job => {
            return {
                ...job,
                job_id: job._id,
                applicants: formattedApps.filter(app => app.job_id.toString() === job._id.toString())
            };
        });

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error fetching dashboard data' });
    }
};

// --- GET SEEKER DASHBOARD DATA ---
const getSeekerDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Access denied. Seekers only.' });
        }

        const applications = await Application.find({ seeker_id: userId })
            .populate('job_id')
            .sort({ createdAt: -1 })
            .lean();

        const formattedApps = await Promise.all(applications.map(async (app) => {
            const job = app.job_id;
            let company_name = 'Unknown';
            if (job && job.employer_id) {
                const emp = await EmployerProfile.findOne({ user_id: job.employer_id });
                if (emp) company_name = emp.company_name;
            }
            return {
                application_id: app._id,
                status: app.status,
                job_id: job?._id,
                title: job?.title,
                location: job?.location,
                job_type: job?.job_type,
                company_name
            };
        }));

        res.status(200).json(formattedApps);
    } catch (error) {
        console.error("Seeker Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error fetching seeker dashboard' });
    }
};

// --- UPDATE APPLICATION STATUS ---
const updateApplicationStatus = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can update status' });
        }

        const appId = req.params.applicationId;
        const { status } = req.body; 

        await Application.findByIdAndUpdate(appId, { status });
        res.status(200).json({ message: `Application ${status} successfully!` });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: 'Server Error updating status' });
    }
};

// --- DELETE A JOB ---
const deleteJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const jobId = req.params.id;
        const employerId = req.user.userId;

        const job = await Job.findOneAndDelete({ _id: jobId, employer_id: employerId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Job deleted successfully!' });
    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ message: 'Server Error deleting job.' });
    }
};

// --- UPDATE A JOB ---
const updateJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const jobId = req.params.id;
        const employerId = req.user.userId;
        const { title, description, required_skills, salary, location, job_type } = req.body;

        const updatedJob = await Job.findOneAndUpdate(
            { _id: jobId, employer_id: employerId },
            { title, description, required_skills, salary, location, job_type },
            { new: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Job updated successfully!' });
    } catch (error) {
        console.error("Update Job Error:", error);
        res.status(500).json({ message: 'Server Error updating job.' });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    getEmployerDashboard,
    getSeekerDashboard,
    updateApplicationStatus,
    deleteJob,
    updateJob
};