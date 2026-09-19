const express = require('express');
const router = express.Router();
const { 
    createJob, 
    getAllJobs, 
    getJobById, 
    getEmployerDashboard, 
    getSeekerDashboard, 
    updateApplicationStatus, 
    deleteJob, 
    updateJob 
} = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getAllJobs);
router.post('/', authMiddleware, createJob);
router.get('/employer/dashboard', authMiddleware, getEmployerDashboard);
router.get('/seeker/dashboard', authMiddleware, getSeekerDashboard);
router.get('/:id', getJobById);
router.delete('/:id', authMiddleware, deleteJob);
router.put('/:id', authMiddleware, updateJob);
router.put('/applications/:applicationId', authMiddleware, updateApplicationStatus);

module.exports = router;