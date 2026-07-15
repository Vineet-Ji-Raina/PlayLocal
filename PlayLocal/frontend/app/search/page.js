"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import RequestModal from '@/components/RequestModal';
import { Trophy, Filter, MapPin, Calendar, Compass, Sliders, RefreshCw, Send, AlertCircle } from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Haversine formula to compute distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

export default function Search() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [radius, setRadius] = useState('10'); // 10 km default

  // Proposal modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Authenticate user & load initial data
  useEffect(() => {
    const user = api.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // Fetch games list
    const fetchGamesList = async () => {
      try {
        const gameList = await api.getGames();
        setGames(gameList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGamesList();
  }, [router]);

  // Perform search query
  const performSearch = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');

    // Coordinates of current user: [longitude, latitude] in GeoJSON
    const [userLng, userLat] = currentUser.location?.coordinates || [72.8258, 19.0596];

    try {
      const results = await api.searchUsers({
        game: selectedGame,
        skill: selectedSkill,
        availability: selectedDay,
        radius: radius,
        lat: userLat,
        lng: userLng
      });
      setPlayers(results);
    } catch (err) {
      setError(err.message || 'Failed to search nearby players');
    } finally {
      setLoading(false);
    }
  };

  // Run search when filters change or user loads
  useEffect(() => {
    if (currentUser) {
      performSearch();
    }
  }, [currentUser, selectedGame, selectedSkill, selectedDay, radius]);

  const handleOpenProposal = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  // Center coordinates for map
  const userLng = currentUser?.location?.coordinates[0] || 72.8258;
  const userLat = currentUser?.location?.coordinates[1] || 19.0596;

  // Build markers list
  const mapMarkers = [
    // Current user marker
    {
      position: [userLat, userLng],
      popupText: `<b>You (${currentUser?.name})</b><br/>Your location`,
      isCurrentUser: true
    },
    // Matches markers
    ...players.map(player => ({
      position: [player.location.coordinates[1], player.location.coordinates[0]],
      popupText: `
        <div class="p-1">
          <h4 class="font-bold text-slate-900">${player.name}</h4>
          <p class="text-[10px] text-indigo-600 font-semibold capitalize">${player.skillLevel} skill</p>
          <p class="text-xs text-slate-600 mt-1">${player.bio || ''}</p>
        </div>
      `,
      isCurrentUser: false
    }))
  ];

  return (
    <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      
      {/* Search sidebar and list */}
      <div className="w-full md:w-[450px] flex flex-col border-r border-slate-900 h-full overflow-hidden bg-slate-900/10">
        
        {/* Filters Panel */}
        <div className="p-4 sm:p-6 border-b border-slate-900 bg-slate-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-indigo-400" />
              <span>Search Filters</span>
            </h2>
            <button
              onClick={() => {
                setSelectedGame('');
                setSelectedSkill('');
                setSelectedDay('');
                setRadius('10');
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Game Category */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Game</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-1 focus:ring-indigo-500 w-full px-2.5 py-2 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">Any Game</option>
                {games.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Skill Level */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-1 focus:ring-indigo-500 w-full px-2.5 py-2 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">Any Skill</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Availability</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-1 focus:ring-indigo-500 w-full px-2.5 py-2 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">Any Day</option>
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Distance Radius */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Radius (km)</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-1 focus:ring-indigo-500 w-full px-2.5 py-2 text-xs focus:outline-none cursor-pointer"
              >
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players List Grid */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Searching nearby players...</p>
            </div>
          ) : error ? (
            <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-2xl flex items-start space-x-2 text-red-300 text-sm">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Compass className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-sm">No partners found</h3>
              <p className="text-xs text-slate-500 max-w-[280px] mx-auto">Try widening your search radius or modifying your filtering parameters.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">{players.length} matching players nearby</p>
              
              <div className="space-y-4 pb-4">
                {players.map((player) => {
                  const distance = calculateDistance(
                    userLat, userLng,
                    player.location.coordinates[1], player.location.coordinates[0]
                  );

                  return (
                    <div
                      key={player._id}
                      className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 hover:border-slate-800 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Upper card row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={player.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={player.name}
                              className="h-10 w-10 rounded-full object-cover border border-slate-800"
                            />
                            <div>
                              <h3 className="font-bold text-white text-sm">{player.name}</h3>
                              <p className="text-[10px] text-slate-400 flex items-center mt-0.5">
                                <MapPin className="h-3 w-3 text-slate-500 mr-1" />
                                {player.location?.address.split(',')[0]} ({distance.toFixed(1)} km)
                              </p>
                            </div>
                          </div>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            player.skillLevel === 'advanced' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            player.skillLevel === 'intermediate' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                            'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}>
                            {player.skillLevel}
                          </span>
                        </div>

                        {/* Bio */}
                        {player.bio && (
                          <p className="text-xs text-slate-400 mt-3 italic line-clamp-2">
                            "{player.bio}"
                          </p>
                        )}

                        {/* Preferred games badges */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {player.preferredGames?.map(g => (
                            <span key={g._id} className="text-[9px] font-semibold bg-slate-950/60 text-slate-300 px-2 py-0.5 rounded border border-slate-900">
                              {g.name}
                            </span>
                          ))}
                        </div>

                        {/* Availability Summary */}
                        {player.availability?.length > 0 && (
                          <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">
                              {player.availability.map(a => a.day).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action CTA */}
                      <button
                        onClick={() => handleOpenProposal(player)}
                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Play Request</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map display */}
      <div className="flex-grow h-full relative">
        {currentUser && (
          <LeafletMap
            center={[userLat, userLng]}
            zoom={13}
            markers={mapMarkers}
          />
        )}
      </div>

      {/* Request play modal */}
      {currentUser && (
        <RequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetUser={selectedPlayer}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
