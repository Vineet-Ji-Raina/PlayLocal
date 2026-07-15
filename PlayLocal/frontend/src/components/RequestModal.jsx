import React, { useState } from 'react';
import axios from 'axios';

const RequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    proposedDate: '',
    playTime: '',
    childName: '',
    ageGroup: '',
    message: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate date
    if (!formData.proposedDate) {
      setError('Please select a date');
      setLoading(false);
      return;
    }

    // Validate time
    if (!formData.playTime) {
      setError('Please select a time');
      setLoading(false);
      return;
    }

    // Check if date is valid
    const dateObj = new Date(formData.proposedDate);
    if (isNaN(dateObj.getTime())) {
      setError('Invalid date selected. Please choose a valid date.');
      setLoading(false);
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      setError('Date cannot be in the past. Please select a future date.');
      setLoading(false);
      return;
    }

    try {
      // Send to backend
      const payload = {
        proposedDate: dateObj.toISOString(),
        playTime: formData.playTime,
        childName: formData.childName,
        ageGroup: formData.ageGroup,
        message: formData.message
      };

      // Replace with your actual API endpoint
      const response = await axios.post('/api/request-play', payload);
      
      setSuccess('🎉 Play date request submitted successfully!');
      setFormData({
        proposedDate: '',
        playTime: '',
        childName: '',
        ageGroup: '',
        message: ''
      });

      if (onSuccess) onSuccess(response.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  // If modal is not open, don't render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🎮 Request Play Date
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Date *
            </label>
            <input
              type="date"
              name="proposedDate"
              value={formData.proposedDate}
              onChange={handleChange}
              min={today}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Select a date for the play session</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Play Time *
            </label>
            <input
              type="time"
              name="playTime"
              value={formData.playTime}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Choose a time for the play session</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child's Name
            </label>
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              placeholder="Enter child's name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Group
            </label>
            <select
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select age group</option>
              <option value="infant">Infant (0-12 months)</option>
              <option value="toddler">Toddler (1-3 years)</option>
              <option value="preschool">Preschool (3-5 years)</option>
              <option value="school">School Age (6+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any special requests or notes..."
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm border border-green-200">
              ✅ {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Sending...' : '📤 Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;