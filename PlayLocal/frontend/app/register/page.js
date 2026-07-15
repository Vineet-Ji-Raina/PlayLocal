"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { User, Mail, Lock, Trophy, ArrowRight, ArrowLeft, Check, AlertCircle, MapPin, Calendar, BookOpen } from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_PRESETS = [
  { label: 'Morning (09:00 - 12:00)', value: '09:00-12:00' },
  { label: 'Afternoon (12:00 - 16:00)', value: '12:00-16:00' },
  { label: 'Evening (16:00 - 20:00)', value: '16:00-20:00' },
  { label: 'Night (20:00 - 22:00)', value: '20:00-22:00' }
];

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [preferredGames, setPreferredGames] = useState([]);
  const [skillLevel, setSkillLevel] = useState('intermediate');
  
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState([]); // Array of { day, timeSlots }

  // Mumbai defaults
  const [address, setAddress] = useState('Bandra West, Mumbai');
  const [coordinates, setCoordinates] = useState([19.0596, 72.8258]); // [lat, lng] for frontend

  useEffect(() => {
    // Redirect if already logged in
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      router.push('/search');
    }
  }, [router]);

  // Load available games from API on step 2
  useEffect(() => {
    if (step === 2 && games.length === 0) {
      const fetchGames = async () => {
        try {
          const data = await api.getGames();
          setGames(data);
        } catch (err) {
          setError('Failed to load game categories');
        }
      };
      fetchGames();
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1 && (!name || !email || !password)) {
      setError('Please fill in all account fields');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep(step - 1);
  };

  // Toggle game preference
  const toggleGame = (gameId) => {
    if (preferredGames.includes(gameId)) {
      setPreferredGames(preferredGames.filter(id => id !== gameId));
    } else {
      setPreferredGames([...preferredGames, gameId]);
    }
  };

  // Toggle availability day & slots
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

  const handleMapClick = (lat, lng) => {
    setCoordinates([lat, lng]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      preferredGames,
      skillLevel,
      availability,
      bio,
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]], // [longitude, latitude] for GeoJSON
        address
      }
    };

    try {
      await api.register(payload);
      router.push('/search');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setStep(1); // Go back to step 1 to fix account issues if there's a conflict
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
        
        {/* Header & Steps Indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Trophy className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Player Profile</h2>
          
          {/* Progress Bar */}
          <div className="mt-6 flex items-center justify-between max-w-xs mx-auto text-xs text-slate-500">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-400' : ''}`}>
              <span className={`h-6 w-6 rounded-full border flex items-center justify-center font-semibold mb-1 ${step >= 1 ? 'border-indigo-500 bg-indigo-950/50' : 'border-slate-800'}`}>1</span>
              <span>Account</span>
            </div>
            <div className="flex-grow border-t border-slate-800 mx-2 mb-4" />
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-400' : ''}`}>
              <span className={`h-6 w-6 rounded-full border flex items-center justify-center font-semibold mb-1 ${step >= 2 ? 'border-indigo-500 bg-indigo-950/50' : 'border-slate-800'}`}>2</span>
              <span>Games</span>
            </div>
            <div className="flex-grow border-t border-slate-800 mx-2 mb-4" />
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-400' : ''}`}>
              <span className={`h-6 w-6 rounded-full border flex items-center justify-center font-semibold mb-1 ${step >= 3 ? 'border-indigo-500 bg-indigo-950/50' : 'border-slate-800'}`}>3</span>
              <span>Schedule</span>
            </div>
            <div className="flex-grow border-t border-slate-800 mx-2 mb-4" />
            <div className={`flex flex-col items-center ${step >= 4 ? 'text-indigo-400' : ''}`}>
              <span className={`h-6 w-6 rounded-full border flex items-center justify-center font-semibold mb-1 ${step >= 4 ? 'border-indigo-500 bg-indigo-950/50' : 'border-slate-800'}`}>4</span>
              <span>Location</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-900 text-red-300 px-4 py-3 rounded-xl flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* STEP 1: Account Credentials */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><User className="h-5 w-5" /></span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-3 text-sm focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Mail className="h-5 w-5" /></span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-3 text-sm focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Lock className="h-5 w-5" /></span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-3 text-sm focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full flex justify-center items-center py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl mt-8 cursor-pointer transition-colors shadow-lg"
              >
                <span>Continue Setup</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Preferred Games & Skill level */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-200 block mb-3">Preferred Games (Select multiple)</label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {games.map(game => (
                    <button
                      key={game._id}
                      type="button"
                      onClick={() => toggleGame(game._id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                        preferredGames.includes(game._id)
                          ? 'border-indigo-500 bg-indigo-950/30 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{game.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{game.category}</span>
                      </div>
                      {preferredGames.includes(game._id) && (
                        <Check className="h-4 w-4 text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-200 block mb-3">Your Skill Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSkillLevel(level)}
                      className={`py-3 px-2 border rounded-xl font-semibold capitalize text-sm text-center transition-all cursor-pointer ${
                        skillLevel === level
                          ? 'border-indigo-500 bg-indigo-950/30 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 flex justify-center items-center py-3.5 px-4 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex justify-center items-center py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Availability & Bio */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Short Profile Bio</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-slate-500"><BookOpen className="h-5 w-5" /></span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-2 text-sm focus:outline-none min-h-[80px]"
                    placeholder="Tell local players a bit about yourself, your favorite matches, equipment, etc..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-200 block mb-2">Weekly Availability</label>
                <p className="text-xs text-slate-500 mb-4">Select days you are free, then choose time slots.</p>
                
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {DAYS.map(day => {
                    const isSelected = availability.some(a => a.day === day);
                    const currentObj = availability.find(a => a.day === day);

                    return (
                      <div key={day} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>{day}</span>
                          <button
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-950/30 text-indigo-400 border-indigo-800'
                                : 'bg-slate-950/80 text-slate-500 border-slate-850 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {isSelected ? 'Free' : 'Unavailable'}
                          </button>
                        </div>

                        {isSelected && currentObj && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
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

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 flex justify-center items-center py-3.5 px-4 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex justify-center items-center py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Geographic Location Map */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Playing Neighborhood / Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><MapPin className="h-5 w-5" /></span>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full pl-10 pr-3 py-3 text-sm focus:outline-none"
                    placeholder="Bandra West, Mumbai, 400050"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-200 block mb-2">Pin Playing Location on Map</label>
                <div className="h-60 w-full rounded-2xl overflow-hidden border border-slate-800">
                  <LeafletMap
                    center={[coordinates[0], coordinates[1]]}
                    zoom={13}
                    isSelectionMode={true}
                    selectionMarker={coordinates}
                    onClick={handleMapClick}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>Latitude: {coordinates[0].toFixed(5)}</span>
                  <span>Longitude: {coordinates[1].toFixed(5)}</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 flex justify-center items-center py-3.5 px-4 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Creating Profile...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
