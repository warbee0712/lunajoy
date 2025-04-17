import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';

const MentalHealthLogForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    log_date: '',
    mood: '',
    anxiety: '',
    sleep_hours: '',
    sleep_quality: '',
    physical_activity: '',
    physical_activity_duration: '',
    social_interactions: '',
    stress: '',
    symptoms: '',
    symptom_severity: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.log_date || !formData.mood || !formData.anxiety || !formData.stress) {
      alert('Please fill in all required fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const formattedData = {
      log_date: formData.log_date || new Date().toISOString().split('T')[0],
      mood: Number(formData.mood),
      anxiety: Number(formData.anxiety),
      sleep_hours: Number(formData.sleep_hours),
      sleep_quality: formData.sleep_quality,
      physical_activity: formData.physical_activity,
      physical_activity_duration: Number(formData.physical_activity_duration),
      social_interactions: Number(formData.social_interactions),
      stress: Number(formData.stress),
      symptoms: formData.symptoms,
      symptom_severity: Number(formData.symptom_severity),
    };

    onSubmit(formattedData)
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const inputWithTooltip = (label, name, type, tip, props = {}) => (
    <div className="space-y-1">
      <label htmlFor={name} className="block font-medium text-gray-700">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        data-tooltip-id={`${name}-tip`}
        data-tooltip-content={tip}
        {...props}
      />
      <Tooltip id={`${name}-tip`} place="top" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">
        Daily Mental Health Log
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {inputWithTooltip("Log Date", "log_date", "date", "Please select the date you are recording this log.", { required: true })}
        {inputWithTooltip("Mood", "mood", "number", "Rate your mood from 0 (lowest) to 10 (highest).", { min: 0, max: 10, required: true })}
        {inputWithTooltip("Anxiety", "anxiety", "number", "Rate your anxiety from 0 (none) to 10 (extreme).", { min: 0, max: 10, required: true })}
        {inputWithTooltip("Sleep Hours", "sleep_hours", "number", "Enter the number of hours you slept.", { min: 0, required: true })}

        <div className="space-y-1">
          <label htmlFor="sleep_quality" className="block font-medium text-gray-700">Sleep Quality</label>
          <select
            id="sleep_quality"
            name="sleep_quality"
            value={formData.sleep_quality}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            data-tooltip-id="sleep_quality-tip"
            data-tooltip-content="Select your sleep quality for the night."
          >
            <option value="">Select</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Poor">Poor</option>
          </select>
          <Tooltip id="sleep_quality-tip" place="top" />
        </div>

        {inputWithTooltip("Physical Activity", "physical_activity", "text", "Describe any physical activity you engaged in.", { required: true })}
        {inputWithTooltip("Activity Duration (minutes)", "physical_activity_duration", "number", "Duration of physical activity in minutes.", { min: 0, required: true })}
        {inputWithTooltip("Social Interactions", "social_interactions", "number", "Rate social interaction from 0 to 10.", { min: 0, max: 10, required: true })}
        {inputWithTooltip("Stress", "stress", "number", "Rate your stress from 0 (low) to 10 (high).", { min: 0, max: 10, required: true })}
        {inputWithTooltip("Symptoms", "symptoms", "text", "Describe any symptoms you're experiencing.")}
        {inputWithTooltip("Symptom Severity", "symptom_severity", "number", "Rate symptom severity from 0 to 10.", { min: 0, max: 10 })}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentalHealthLogForm;
