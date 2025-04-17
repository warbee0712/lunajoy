const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');

// Route to get all mental health logs for a user
router.get('/:userId', getLogs);

module.exports = router;