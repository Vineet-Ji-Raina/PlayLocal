"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Trophy, Mail, Calendar, MapPin, Edit3, Check, ShieldAlert, Award, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_PRESETS = [
  { label: 'Morning (09:00 - 12:00)', value: '09:00-12:00' },
  { label: 'Afternoon (12:00 - 16:00)', value: '12:00-16:00' },
  { label: 'Evening (16:00 - 20:00)', value: '16:00-20:00' },
  { label: 'Night (20:00 - 22:00)', value: '20:00-22:00' }
];

export default function Profile() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [preferredGames, setPreferredGames] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [address, setAddress] = useState('');

  const loadData = async (userId) => {
    try {
      const p = await api.getProfile(userId);
      setProfile(p);
      
      // Load inputs
      setName(p.name || '');
      setBio(p.bio || '');
      setSkillLevel(p.skillLevel || 'intermediate');
      setPreferredGames(p.preferredGames?.map(g => g._id) || []);
      setAvailability(p.availability || []);
      setAddress(p.location?.address || '');

      const gList = await api.getGames();
      setGames(gList);
    } catch (err) {
      setError(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = api.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadData(user._id);
  }, [router]);

  const toggleGame = (gameId) => {
    if (preferredGames.includes(gameId)) {
      setPreferredGames(preferredGames.filter(id => id !== gameId));
    } else {
      setPreferredGames([...preferredGames, gameId]);
    }
  };

  const handleDayToggle = (day) => {
    const existing = availability.find(a => a.day === day);
    if (existing) {
      setAvailability(availability.filter(a => a.day !== day));
    } else {
      setAvailability([...availability, { day, timeSlots: ['16:00-20:00'] }]);
    }
  };

  const handleSlotToggle = (day, slot) => {
    setAvailability(availability.map(a => {
      if (a.day === day) {
        const slots = a.timeSlots.includes(slot)
          ? a.timeSlots.filter(s => s !== slot)
          : [...a.timeSlots, slot];
        return { ...a, timeSlots: slots };
      }
      return a;
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const payload = {
      name,
      bio,
      skillLevel,
      preferredGames,
      availability,
      location: {
        ...profile.location,
        address
      }
    };

    try {
      await api.updateProfile(currentUser._id, payload);
      setSuccess(true);
      setIsEditing(false);
      loadData(currentUser._id);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completedMatches = profile?.matchHistory?.filter(r => r.status === 'completed') || [];

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 max-w-4xl mx-auto w-full">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your profile...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Upper banner Card */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <img
                src={profile.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={profile.name}
                className="h-20 w-20 rounded-full border border-indigo-500 object-cover"
              />
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile.name}</h1>
                <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start">
                  <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                  <span>{profile.email}</span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1.5">
                  <span className="text-[10px] font-bold bg-indigo-950 border border-indigo-800 text-indigo-400 px-2.5 py-0.5 rounded-full capitalize">
                    {profile.skillLevel} Player
                  </span>
                  <span className="text-[10px] font-bold bg-slate-955 bg-slate-950 text-slate-400 border border-slate-900 px-2.5 py-0.5 rounded-full">
                    {completedMatches.length} matches completed
                  </span>
                  {profile.role === 'admin' && (
                    <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      System Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/10 transition-colors w-full sm:w-auto justify-center"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {success && (
            <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-300 p-4 rounded-xl flex items-center space-x-2 text-sm">
              <Check className="h-5 w-5 text-emerald-400" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="bg-red-950/40 border border-red-900 text-red-300 p-4 rounded-xl flex items-center space-x-2 text-sm">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* EDIT MODE FORM */}
          {isEditing ? (
            <form onSubmit={handleUpdate} className="bg-slate-900/10 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Edit Profile Fields</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full px-3.5 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Playing Neighborhood Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full px-3.5 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">About Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full px-3.5 py-2 text-sm focus:outline-none min-h-[90px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Skill Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSkillLevel(level)}
                      className={`py-2 px-2 border rounded-xl font-semibold capitalize text-xs text-center transition-all cursor-pointer ${
                        skillLevel === level
                          ? 'border-indigo-500 bg-indigo-950/30 text-white'
                          : 'border-slate-850 bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game select */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Preferred Games</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {games.map(game => (
                    <button
                      key={game._id}
                      type="button"
                      onClick={() => toggleGame(game._id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        preferredGames.includes(game._id)
                          ? 'border-indigo-500 bg-indigo-950/30 text-white'
                          : 'border-slate-850 bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold">{game.name}</span>
                      {preferredGames.includes(game._id) && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability slots */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Weekly Availability</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {DAYS.map(day => {
                    const isSelected = availability.some(a => a.day === day);
                    const currentObj = availability.find(a => a.day === day);

                    return (
                      <div key={day} className="bg-slate-950/30 border border-slate-850 border-slate-800 rounded-xl p-3 flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>{day}</span>
                          <button
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-2 py-0.5 text-[10px] rounded-lg font-bold border cursor-pointer ${
                              isSelected ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900' : 'bg-slate-950 text-slate-500 border-slate-800'
                            }`}
                          >
                            {isSelected ? 'Available' : 'Unavailable'}
                          </button>
                        </div>
                        {isSelected && currentObj && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {TIME_PRESETS.map(preset => {
                              const isSlotSelected = currentObj.timeSlots.includes(preset.value);
                              return (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => handleSlotToggle(day, preset.value)}
                                  className={`py-1.5 px-2 text-[10px] font-semibold border rounded-lg transition-all cursor-pointer text-center ${
                                    isSlotSelected
                                      ? 'border-indigo-500 bg-indigo-950/50 text-white'
                                      : 'border-slate-900 bg-slate-950/90 text-slate-500 hover:border-slate-800'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex space-x-3 pt-4 font-semibold">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-4 bg-slate-900 border border-slate-850 border-slate-800 text-slate-400 hover:text-white text-sm rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl cursor-pointer shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            // DISPLAY VIEW
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left sidebar info details */}
              <div className="space-y-6 md:col-span-1">
                {/* Details list */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm">Player Profile Details</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center text-slate-400">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-400 shrink-0" />
                      <span>{profile.location?.address}</span>
                    </div>
                    {profile.bio && (
                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Biography</span>
                        <p className="text-slate-350 text-slate-300 italic">"{profile.bio}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferred Games */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-3">
                  <h3 className="font-bold text-white text-sm">Preferred Games</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.preferredGames?.map(g => (
                      <span key={g._id} className="text-xs bg-slate-950 text-indigo-400 border border-slate-900 px-3 py-1 rounded-xl font-medium">
                        {g.name}
                      </span>
                    ))}
                    {profile.preferredGames?.length === 0 && (
                      <span className="text-xs text-slate-500">No preferred games selected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main content Area */}
              <div className="space-y-6 md:col-span-2">
                {/* Weekly availability */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                    <Calendar className="h-4.5 w-4.5 text-indigo-400" />
                    <span>My Availability Schedule</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {profile.availability?.map(a => (
                      <div key={a.day} className="bg-slate-950/60 border border-slate-900 p-3 rounded-2xl">
                        <span className="font-bold text-white text-sm block mb-1.5 text-indigo-400">{a.day}</span>
                        <div className="flex flex-wrap gap-1">
                          {a.timeSlots?.map(s => (
                            <span key={s} className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {profile.availability?.length === 0 && (
                      <span className="text-xs text-slate-500 col-span-2">No availability schedule set.</span>
                    )}
                  </div>
                </div>

                {/* Match logs history */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                    <Award className="h-4.5 w-4.5 text-indigo-400" />
                    <span>My Matches History ({profile.matchHistory?.length || 0})</span>
                  </h3>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {profile.matchHistory?.map(m => {
                      const isSender = m.sender?._id === currentUser?._id;
                      const partner = isSender ? m.receiver : m.sender;

                      return (
                        <div key={m._id} className="bg-slate-950/40 border border-slate-900 p-3 rounded-2xl flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center space-x-3">
                            <img src={partner?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={partner?.name} className="h-8 w-8 rounded-full object-cover" />
                            <div>
                              <span className="font-bold text-slate-350 text-slate-300 block">{partner?.name}</span>
                              <span className="text-[10px] text-slate-500">{m.game?.name} • {formatTime(m.proposedTime)}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1">
                            {m.status === 'completed' && <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded text-[10px] font-bold capitalize">Completed</span>}
                            {m.status === 'accepted' && <span className="bg-indigo-950 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded text-[10px] font-bold capitalize">Accepted</span>}
                            {m.status === 'declined' && <span className="bg-red-950 text-red-400 border border-red-900/60 px-2 py-0.5 rounded text-[10px] font-bold capitalize">Declined</span>}
                          </div>
                        </div>
                      );
                    })}

                    {(!profile.matchHistory || profile.matchHistory.length === 0) && (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No matches played yet. Connect with users to get started!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
