import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import GoogleLoginButton from './components/Auth/GoogleLoginButton';
import MentalHealthLogForm from './components/Forms/MentalHealthLogForm';
import MentalHealthChart from './components/Chart/MentalHealthChart';
import { jwtDecode } from 'jwt-decode';
import api from './utils/api';
import { io } from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [logData, setLogData] = useState({
    dates: [],
    mood: [],
    anxiety: [],
    stress: [],
    sleep_hours: [],
    sleep_quality: [],
    physical_activity: [],
    physical_activity_duration: [],
    social_interactions: [],
    symptoms: [],
    symptom_severity: []
  });
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const socketRef = useRef(null);

  // Google Login Handler
  const handleLogin = async (googleData) => {
    try {
      const { credential: token } = googleData;
      const { data } = await api.post('/auth/google', { token });

      localStorage.setItem('jwtToken', data.token);
      setUser(data.user);
      fetchLogs(data.user.id);
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please try again.');
    }
  };

  // Fetch logs from API
  const fetchLogs = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/logs/${userId}`);
      const logs = data.logs || [];
      logs.sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

      // Update the log data state to handle all fields
      setLogData({
        dates: logs.map((log) => log.log_date),
        mood: logs.map((log) => log.mood),
        anxiety: logs.map((log) => log.anxiety),
        stress: logs.map((log) => log.stress),
        sleep_hours: logs.map((log) => log.sleep_hours),
        sleep_quality: logs.map((log) => log.sleep_quality),
        physical_activity: logs.map((log) => log.physical_activity),
        physical_activity_duration: logs.map((log) => log.physical_activity_duration),
        social_interactions: logs.map((log) => log.social_interactions),
        symptoms: logs.map((log) => log.symptoms),
        symptom_severity: logs.map((log) => log.symptom_severity)
      });
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Submit new log to API
  const handleLogSubmit = async (data) => {
    if (!user?.id) return;

    setFormSubmitting(true);
    try {
      if (
        !data.mood ||
        !data.anxiety ||
        !data.stress ||
        !data.sleep_hours ||
        !data.sleep_quality ||
        !data.physical_activity ||
        !data.physical_activity_duration ||
        !data.social_interactions ||
        !data.symptoms ||
        !data.symptom_severity
      ) {
        alert('Please complete all required fields before submitting.');
        return;
      }

      const payload = {
        userId: user.id,
        log_date: data.log_date || new Date().toISOString().split('T')[0],
        mood: data.mood,
        anxiety: data.anxiety,
        stress: data.stress,
        sleep_hours: data.sleep_hours,
        sleep_quality: data.sleep_quality,
        physical_activity: data.physical_activity,
        physical_activity_duration: data.physical_activity_duration,
        social_interactions: data.social_interactions,
        symptoms: data.symptoms,
        symptom_severity: data.symptom_severity
      };

      const response = await api.post('/log', payload);

      if (response.status >= 200 && response.status < 300) {
        setShowSuccessModal(true);
        fetchLogs(user.id);
      } else {
        throw new Error('Server responded with an error.');
      }
    } catch (err) {
      console.error('Log submission failed:', err);
      alert('Failed to submit log. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Initialize Socket connection and handle new logs
  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io(ENDPOINT);
    const socket = socketRef.current;

    socket.emit('joinRoom', user.id);

    socket.on('newLog', (log) => {
      if (log.userId !== user.id) return;

      setLogData((prev) => {
        if (prev.dates.includes(log.log_date)) return prev;

        return {
          dates: [...prev.dates, log.log_date],
          mood: [...prev.mood, log.mood],
          anxiety: [...prev.anxiety, log.anxiety],
          stress: [...prev.stress, log.stress],
          sleep_hours: [...prev.sleep_hours, log.sleep_hours],
          sleep_quality: [...prev.sleep_quality, log.sleep_quality],
          physical_activity: [...prev.physical_activity, log.physical_activity],
          physical_activity_duration: [...prev.physical_activity_duration, log.physical_activity_duration],
          social_interactions: [...prev.social_interactions, log.social_interactions],
          symptoms: [...prev.symptoms, log.symptoms],
          symptom_severity: [...prev.symptom_severity, log.symptom_severity]
        };
      });
    });

    return () => {
      socket.emit('leaveRoom', user.id);
      socket.disconnect();
    };
  }, [user?.id]);

  // Restore user from JWT token if available
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        fetchLogs(decoded.id);
      } catch (err) {
        console.error('Invalid JWT:', err);
        localStorage.removeItem('jwtToken');
      }
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    setLogData({
      dates: [],
      mood: [],
      anxiety: [],
      stress: [],
      sleep_hours: [],
      sleep_quality: [],
      physical_activity: [],
      physical_activity_duration: [],
      social_interactions: [],
      symptoms: [],
      symptom_severity: []
    });
    socketRef.current?.emit('leaveRoom', user?.id);
    socketRef.current?.disconnect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-gray-800 p-6">
      <div className="container mx-auto max-w-6xl bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Mental Health Tracker</h1>

        {!user ? (
          <div className="flex justify-center mt-10">
            <GoogleLoginButton onSuccess={handleLogin} onFailure={() => alert('Login failed')} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">Welcome, {user.name}</h2>
              <button onClick={handleLogout} className="text-sm text-blue-600 hover:underline">
                Logout
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="w-full">
                <MentalHealthLogForm onSubmit={handleLogSubmit} />
              </div>
              <div className="w-full">
                {loading && <p className="text-center text-gray-600">Loading chart...</p>}
                {error && <p className="text-center text-red-600">{error}</p>}
                {!loading && logData.dates.length > 0 && <MentalHealthChart data={logData} />}
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-gray-800 text-center">
              <h3 className="text-lg font-semibold">Log Submitted Successfully!</h3>
              <p>Your mental health log has been recorded.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-4 text-blue-600 hover:underline focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {formSubmitting && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-gray-800">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600"></div>
                <p className="text-gray-700 font-semibold">Submitting...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
