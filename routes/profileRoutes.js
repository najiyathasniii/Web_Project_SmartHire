const express = require('express');
const router = express.Router();
const { getProfile, updateSeekerProfile, updateEmployerProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes definitions
router.get('/', authMiddleware, getProfile);
router.put('/seeker', authMiddleware, updateSeekerProfile);
router.put('/employer', authMiddleware, updateEmployerProfile);

module.exports = router;