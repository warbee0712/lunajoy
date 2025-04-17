const { insertMentalHealthLog, getLogsByUserId } = require('../models/db');

// Submit a new mental health log
const submitLog = async (req, res) => {
  try {
    const {
      userId,
      mood,
      anxiety,
      stress,
      sleep_hours,
      sleep_quality,
      physical_activity,
      physical_activity_duration,
      social_interactions,
      symptoms,
      symptom_severity,
      log_date
    } = req.body;

    // Required fields check
    const requiredFields = {
      userId,
      mood,
      anxiety,
      stress,
      sleep_hours,
      sleep_quality,
      physical_activity,
      physical_activity_duration,
      social_interactions,
      symptoms,
      symptom_severity
    };
    

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === '') {
        return res.status(400).json({ error: `Missing required field: ${key}` });
      }
    }

    // Handle the log date
    const finalLogDate = log_date || new Date().toISOString().split('T')[0];

    // Prepare the log data in snake_case for database
    const logData = {
      userId: userId,
      log_date: finalLogDate,
      mood,
      anxiety,
      stress,
      sleep_hours: sleep_hours,
      sleep_quality: sleep_quality,
      physical_activity: physical_activity,
      physical_activity_duration: physical_activity_duration,
      social_interactions: social_interactions,
      symptoms,
      symptom_severity: symptom_severity
    };

    // Insert the log data into the database
    const result = await insertMentalHealthLog(logData);

    // Create a log response to emit to the WebSocket
    const newLog = {
      id: result.logId,
      userId: userId,
      mood,
      anxiety,
      stress,
      log_date: finalLogDate
    };

    req.app.get('io').to(userId).emit('newLog', newLog);

    // Respond with success
    return res.status(201).json({ message: 'Log submitted successfully', logId: result.logId });
  } catch (err) {
    console.error('❌ Error while inserting log:', err.message);
    return res.status(500).json({ error: 'Failed to save log' });
  }
};

// Fetch all logs for a user
const getLogs = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID in request' });
  }

  try {
    const logs = await getLogsByUserId(userId);
    
    if (!logs.length) {
      return res.status(404).json({ message: 'No logs found for this user' });
    }

    return res.json({ logs });
  } catch (err) {
    console.error('❌ Error fetching logs:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve logs' });
  }
};

module.exports = { submitLog, getLogs };
