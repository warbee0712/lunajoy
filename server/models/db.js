const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database file
const dbPath = path.join(__dirname, 'mental_health_tracker.db');

// Create and open the database (or connect to it if it already exists)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    console.log(dbPath);
  }
});

// Initialize the database tables
const initializeDatabase = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,           -- Google ID
      email TEXT,
      name TEXT,
      picture TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('✅ Users table is ready.');
    }
  });

  // Mental health logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS mental_health_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      log_date TEXT DEFAULT (DATE('now')),
      mood INTEGER,
      anxiety INTEGER,
      stress INTEGER,
      sleep_hours INTEGER,
      sleep_quality TEXT,
      physical_activity TEXT,
      physical_activity_duration INTEGER,
      social_interactions INTEGER,
      symptoms TEXT,
      symptom_severity TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating mental_health_logs table:', err.message);
    } else {
      console.log('✅ Mental health logs table is ready.');
    }
  });
};

// Close DB connection
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
};

// Insert mental health log (Refactored to return a Promise)
const insertMentalHealthLog = (logData) => {
  const {
    userId,
    log_date,
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
  } = logData;

  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO mental_health_logs 
      (userId, log_date, mood, anxiety, stress, sleep_hours, sleep_quality, physical_activity, physical_activity_duration, social_interactions, symptoms, symptom_severity) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      userId,
      log_date,
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
    ], function (err) {
      if (err) {
        console.error('Error inserting log data:', err.message);
        reject(err);
      } else {
        console.log('📝 New log entry inserted with ID:', this.lastID);
        resolve({ logId: this.lastID });
      }
    });
  });
};

// Get logs by user ID (Refactored to return a Promise)
const getLogsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM mental_health_logs WHERE userId = ?', [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching logs:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Get logs by date range (Refactored to return a Promise)
const getLogsByDateRange = (userId, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM mental_health_logs 
      WHERE userId = ? AND log_date BETWEEN ? AND ?
    `;
    db.all(query, [userId, startDate, endDate], (err, rows) => {
      if (err) {
        console.error('Error fetching logs by date range:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Find user by ID (Refactored to return a Promise)
const findUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Create new user (Refactored to return a Promise)
const createUser = (userId, email, name, picture) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?)',
      [userId, email, name, picture],
      function (err) {
        if (err) {
          console.error('Error creating user:', err.message);
          reject(err);
        } else {
          resolve({ id: userId, email, name, picture });
        }
      }
    );
  });
};

module.exports = {
  db,
  initializeDatabase,
  closeDatabase,
  insertMentalHealthLog,
  getLogsByUserId,
  getLogsByDateRange,
  findUserById,
  createUser
};
