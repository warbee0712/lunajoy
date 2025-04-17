import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js/auto';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { Combobox } from '@headlessui/react';

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

const MentalHealthChart = ({ data }) => {
  const [viewType, setViewType] = useState('weekly');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const combinedData = useMemo(() => {
    if (!data?.dates?.length) return [];
    return data.dates.map((date, index) => ({
      date,
      mood: data.mood[index],
      anxiety: data.anxiety[index],
      stress: data.stress[index],
      sleep_hours: data.sleep_hours[index],
      sleep_quality: data.sleep_quality[index],
      physical_activity: data.physical_activity[index],
      physical_activity_duration: data.physical_activity_duration[index],
      social_interactions: data.social_interactions[index],
      symptoms: data.symptoms[index],
      symptom_severity: data.symptom_severity[index],
    }));
  }, [data]);

  const periods = useMemo(() => {
    const weeks = new Set();
    const months = new Set();

    combinedData.forEach(({ date }) => {
      const d = dayjs(date);
      weeks.add(d.isoWeekYear() + '-W' + String(d.isoWeek()).padStart(2, '0'));
      months.add(d.format('YYYY-MM'));
    });

    const weekList = Array.from(weeks).sort((a, b) => a.localeCompare(b));
    const monthList = Array.from(months).sort((a, b) => a.localeCompare(b));

    return { weeks: weekList, months: monthList };
  }, [combinedData]);

  useMemo(() => {
    if (viewType === 'weekly' && periods.weeks.length && !selectedPeriod) {
      setSelectedPeriod(periods.weeks[periods.weeks.length - 1]);
    }
    if (viewType === 'monthly' && periods.months.length && !selectedPeriod) {
      setSelectedPeriod(periods.months[periods.months.length - 1]);
    }
  }, [viewType, periods, selectedPeriod]);

  const filteredData = useMemo(() => {
    if (!selectedPeriod) return [];

    if (viewType === 'weekly') {
      const [year, weekStr] = selectedPeriod.split('-W');
      const week = Number(weekStr);
      return combinedData.filter(({ date }) => {
        const d = dayjs(date);
        return d.isoWeek() === week && d.isoWeekYear() === Number(year);
      });
    } else {
      return combinedData.filter(({ date }) =>
        dayjs(date).format('YYYY-MM') === selectedPeriod
      );
    }
  }, [combinedData, viewType, selectedPeriod]);

  const sorted = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sorted.map(entry => entry.date);
  const moodData = sorted.map(entry => entry.mood);
  const anxietyData = sorted.map(entry => entry.anxiety);
  const stressData = sorted.map(entry => entry.stress);
  const sleepHoursData = sorted.map(entry => entry.sleep_hours);
  const sleepQualityData = sorted.map(entry => entry.sleep_quality);
  const physicalActivityData = sorted.map(entry => entry.physical_activity);
  const physicalActivityDurationData = sorted.map(entry => entry.physical_activity_duration);
  const socialInteractionsData = sorted.map(entry => entry.social_interactions);
  const symptomsData = sorted.map(entry => entry.symptoms);
  const symptomSeverityData = sorted.map(entry => entry.symptom_severity);

  const chartData = {
    labels,
    datasets: [
      { label: 'Mood', data: moodData, borderColor: '#4FD1C5', backgroundColor: 'rgba(79, 209, 197, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Anxiety', data: anxietyData, borderColor: '#F56565', backgroundColor: 'rgba(245, 101, 101, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Stress', data: stressData, borderColor: '#ED8936', backgroundColor: 'rgba(237, 137, 54, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Sleep Hours', data: sleepHoursData, borderColor: '#7F9CF5', backgroundColor: 'rgba(127, 156, 245, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Sleep Quality', data: sleepQualityData, borderColor: '#68D391', backgroundColor: 'rgba(104, 211, 145, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Physical Activity', data: physicalActivityData, borderColor: '#FFB74D', backgroundColor: 'rgba(255, 183, 77, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Physical Activity Duration', data: physicalActivityDurationData, borderColor: '#FF6347', backgroundColor: 'rgba(255, 99, 71, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Social Interactions', data: socialInteractionsData, borderColor: '#A0AEC0', backgroundColor: 'rgba(160, 174, 192, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Symptoms', data: symptomsData, borderColor: '#6B46C1', backgroundColor: 'rgba(107, 70, 193, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
      { label: 'Symptom Severity', data: symptomSeverityData, borderColor: '#D53F8C', backgroundColor: 'rgba(213, 63, 140, 0.2)', fill: false, tension: 0.4, pointRadius: 4 },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true },
        onClick: (e, legendItem) => {
          const chart = e.chart; // Access the chart directly from the event
          const datasetIndex = legendItem.datasetIndex; // Get the dataset index from the legend item
          const meta = chart.getDatasetMeta(datasetIndex); // Get dataset metadata by index
  
          // Toggle visibility of the dataset
          meta.hidden = meta.hidden === null ? !chart.data.datasets[datasetIndex].hidden : null;
  
          // Re-render the chart after the change
          chart.update();
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            const date = tooltipItems[0].label;
            return `Date: ${dayjs(date).format('MMM D, YYYY')}`;
          },
          label: (tooltipItem) => {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
          afterBody: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const mood = moodData[index];
            const anxiety = anxietyData[index];
            const stress = stressData[index];
            const entry = combinedData.find(e => dayjs(e.date).isSame(tooltipItems[0].label, 'day'));
  
            let extraInfo = '';
            if (entry) {
              extraInfo = `
        Sleep: ${entry.sleep_hours} hrs (${entry.sleep_quality})
        Activity: ${entry.physical_activity} (${entry.physical_activity_duration} min)
        Social: ${entry.social_interactions}
        Symptoms: ${entry.symptoms} (${entry.symptom_severity})
              `.trim();
            }
  
            return extraInfo ? [extraInfo] : [];
          },
        },
      },
      title: {
        display: true,
        text: 'Mood, Anxiety, Stress, and Other Health Metrics',
        font: { size: 20, weight: 'bold' },
      },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      x: { title: { display: true, text: 'Date' }, grid: { display: false } },
      y: { min: 0, max: 10, title: { display: true, text: 'Level (1–10)' }, ticks: { stepSize: 1 } },
    },
  };

  const formatWeekLabel = (period) => {
    const [year, weekStr] = period.split('-W');
    const week = Number(weekStr);
    const start = dayjs().isoWeek(week).year(Number(year)).startOf('isoWeek');
    const end = start.add(6, 'day');
    return `${start.format('MMM D')} – ${end.format('MMM D')}`;
  };

  const periodOptions = viewType === 'weekly' ? periods.weeks : periods.months;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-700">
          {viewType === 'weekly' ? 'Weekly Overview' : 'Monthly Overview'}
        </h3>
        <div className="flex gap-2 items-center">
          <select
            className="border border-gray-300 rounded p-2"
            value={viewType}
            onChange={(e) => {
              setViewType(e.target.value);
              setSelectedPeriod('');
            }}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <Combobox value={selectedPeriod} onChange={setSelectedPeriod}>
            <div className="relative w-56">
              <Combobox.Input
                className="w-full border border-gray-300 rounded p-2"
                displayValue={(period) =>
                  viewType === 'weekly'
                    ? formatWeekLabel(period)
                    : dayjs(period).format('MMMM YYYY')
                }
                placeholder="Select period"
              />
              <Combobox.Options className="absolute mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded shadow-md z-50">
                {periodOptions.map((period) => (
                  <Combobox.Option
                    key={period}
                    value={period}
                    className={({ active }) =>
                      `cursor-pointer p-2 ${active ? 'bg-blue-100 text-blue-900' : ''}`
                    }
                  >
                    {viewType === 'weekly'
                      ? formatWeekLabel(period)
                      : dayjs(period).format('MMMM YYYY')}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
      </div>

      <Line data={chartData} options={options} />
    </div>
  );
};

MentalHealthChart.propTypes = {
  data: PropTypes.shape({
    dates: PropTypes.arrayOf(PropTypes.string).isRequired,
    mood: PropTypes.arrayOf(PropTypes.number).isRequired,
    anxiety: PropTypes.arrayOf(PropTypes.number).isRequired,
    stress: PropTypes.arrayOf(PropTypes.number).isRequired,
    sleep_hours: PropTypes.arrayOf(PropTypes.number).isRequired,
    sleep_quality: PropTypes.arrayOf(PropTypes.number).isRequired,
    physical_activity: PropTypes.arrayOf(PropTypes.number).isRequired,
    physical_activity_duration: PropTypes.arrayOf(PropTypes.number).isRequired,
    social_interactions: PropTypes.arrayOf(PropTypes.number).isRequired,
    symptoms: PropTypes.arrayOf(PropTypes.number).isRequired,
    symptom_severity: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default MentalHealthChart;