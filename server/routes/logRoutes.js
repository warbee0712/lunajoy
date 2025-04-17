const express = require('express');
const router = express.Router();
const { submitLog } = require('../controllers/logController');

// Route to submit a new mental health log
router.post('/', submitLog);

module.exports = router;
