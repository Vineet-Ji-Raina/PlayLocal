"use client";
import React, { useState } from 'react';
import { api } from '@/lib/api';
import { X, Calendar, MapPin, Trophy, Navigation } from 'lucide-react';

export default function RequestModal({ isOpen, onClose, targetUser, currentUser }) {
  const [game, setGame] = useState('');
  const [venueType, setVenueType] = useState('clubhouse');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!game) {
      setError('Please select a game');
      setLoading(false);
      return;
    }
    if (!time) {
      setError('Please choose a time');
      setLoading(false);
      return;
    }
    if (!address) {
      setError('Please provide an address');
      setLoading(false);
      return;
    }

    try {
      // Use current user's coordinates or target user's coordinates as fallback
      const coords = currentUser?.location?.coordinates || [72.8258, 19.0596];

      await api.createPlayRequest({
        receiver: targetUser._id,
        game,
        proposedLocation: {
          type: venueType,
          address,
          coordinates: coords // defaults to sender coordinates
        },
        proposedTime: new Date(time)
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setGame('');
        setAddress('');
        setTime('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send request. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-lg font-bold text-white">Propose Match</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h4 className="text-xl font-bold text-white">Request Sent!</h4>
            <p className="text-sm text-slate-400">Your proposal has been sent to {targetUser.name}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-950/40 border border-red-900 text-red-300 p-3 rounded-xl text-xs flex items-center space-x-2">
                <span>{error}</span>
              </div>
            )}

            {/* Target User Info */}
            <div className="flex items-center space-x-3 bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl border-slate-800">
              <img
                src={targetUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={targetUser.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-white text-sm">{targetUser.name}</h4>
                <p className="text-xs text-indigo-400 capitalize">{targetUser.skillLevel} Player</p>
              </div>
            </div>

            {/* Select Game */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Select Game</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Trophy className="h-4 w-4" /></span>
                <select
                  required
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-3 text-sm focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="">-- Choose game --</option>
                  {targetUser.preferredGames?.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Venue Type */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Venue Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['home', 'clubhouse', 'ground'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVenueType(type)}
                    className={`py-2 border rounded-xl font-semibold capitalize text-xs text-center transition-all cursor-pointer ${
                      venueType === type
                        ? 'border-indigo-500 bg-indigo-950/30 text-white'
                        : 'border-slate-850 bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Proposed Location Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><MapPin className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-3 text-sm focus:outline-none"
                  placeholder="e.g. Society Clubhouse, Block C"
                />
              </div>
            </div>

            {/* proposedTime */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Proposed Date & Time</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Calendar className="h-4 w-4" /></span>
                <input
                  type="datetime-local"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-3 text-sm focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-900 border border-slate-850 border-slate-800 text-slate-400 hover:text-white text-sm font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Propose Play'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
