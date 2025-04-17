# Mental Health Progress Tracker

A full-stack web application for tracking and visualizing mental health trends over time. Built with empathy and usability in mind, this tool helps users reflect on their mental well-being through daily logging and insightful data visualization.

---

## Features

### User Functionality
- **Google Authentication** – Secure login via Google OAuth
- **Daily Mental Health Logs**  
  Users can track:
  - Mood (1–10 scale)
  - Anxiety levels
  - Sleep patterns (hours, quality, disturbances)
  - Physical activity (type + duration)
  - Social interactions
  - Stress levels
  - Symptoms of depression/anxiety

- **Dynamic Visualization**  
  Interactive charts summarizing weekly/monthly trends for:
  - Mood
  - Anxiety
  - Stress

- **Real-time Chart Updates**  
  Visualizations update live as new entries are logged using WebSocket (Socket.IO)

- **Clean, Accessible UI**  
  Built with TailwindCSS and Headless UI for a fluid user experience with modals, transitions, and tooltips

---

## Tech Stack

| Frontend | Backend | Database |
|---------|---------|----------|
| React, Chart.js, TailwindCSS, Headless UI | Node.js, Express | SQLite |

### Additional Tools
- Google OAuth for secure login
- Day.js for time manipulation
- WebSocket (Socket.IO) for live updates

---