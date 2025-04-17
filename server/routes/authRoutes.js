const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/authController'); // Make sure this path is correct

// Define the route properly — googleLogin must be a function
router.post('/google', googleLogin);

module.exports = router;
