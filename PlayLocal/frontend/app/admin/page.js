"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Shield, Users, Trophy, Play, FileText, Check, Trash2, ShieldAlert, ShieldCheck, Sparkles, MapPin, Activity, HelpCircle } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [reports, setReports] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'games', 'communities', 'reports'

  // Add game form states
  const [newGameName, setNewGameName] = useState('');
  const [newGameCategory, setNewGameCategory] = useState('indoor');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [newGameIcon, setNewGameIcon] = useState('trophy');

  const loadAdminData = async () => {
    try {
      const statsData = await api.getAdminStats();
      setStats(statsData);

      const usersList = await api.getAdminUsers();
      setUsers(usersList);

      const gamesList = await api.getGames();
      setGames(gamesList);

      const reportsList = await api.getAdminReports();
      setReports(reportsList);

      const communitiesList = await api.getCommunities();
      setCommunities(communitiesList);
    } catch (err) {
      setError(err.message || 'Failed to load administrator data');
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
    if (user.role !== 'admin') {
      router.push('/search');
      return;
    }
    setCurrentUser(user);
    loadAdminData();
  }, [router]);

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This will also remove their play requests, match history, and community organization groups.')) return;
    try {
      await api.deleteUser(userId);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Delete user failed');
    }
  };

  const handleVerifyCommunity = async (commId, status) => {
    try {
      await api.verifyCommunity(commId, status);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Verify community failed');
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await api.resolveReport(reportId, 'resolved');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Resolve report failed');
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    if (!newGameName) return;

    try {
      await api.createGame({
        name: newGameName,
        category: newGameCategory,
        description: newGameDesc,
        icon: newGameIcon
      });
      // reset form
      setNewGameName('');
      setNewGameDesc('');
      setNewGameIcon('trophy');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Add game failed');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!confirm('Are you sure you want to delete this game category?')) return;
    try {
      await api.deleteGame(gameId);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Delete game failed');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 bg-slate-950 text-slate-100">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm mt-3">Loading admin statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="bg-red-955 border border-red-900 bg-red-950/20 text-red-300 p-6 rounded-3xl max-w-md text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Admin Load Error</h2>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 max-w-7xl mx-auto w-full">
      <div className="space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <Shield className="h-8 w-8 text-emerald-400" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            System overview, community moderation, user reports, and game catalog management.
          </p>
        </div>

        {/* STATS KPI GRID */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* KPI 1 */}
            <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center space-x-4">
              <div className="h-10 w-10 bg-indigo-950/50 border border-indigo-900 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Users</span>
                <span className="text-xl font-extrabold text-white">{stats.totalUsers}</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center space-x-4">
              <div className="h-10 w-10 bg-indigo-950/50 border border-indigo-900 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Play Requests</span>
                <span className="text-xl font-extrabold text-white">{stats.totalRequests}</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center space-x-4">
              <div className="h-10 w-10 bg-emerald-955/55 bg-emerald-950/50 border border-emerald-900 rounded-xl flex items-center justify-center text-emerald-450 text-emerald-400 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Match Rate</span>
                <span className="text-xl font-extrabold text-white">{stats.matchRate}%</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center space-x-4">
              <div className="h-10 w-10 bg-indigo-950/50 border border-indigo-900 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Users (MAU)</span>
                <span className="text-xl font-extrabold text-white">{stats.mau}</span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center space-x-4 col-span-2 lg:col-span-1">
              <div className="h-10 w-10 bg-indigo-950/50 border border-indigo-900 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Repeat Rate</span>
                <span className="text-xl font-extrabold text-white">{stats.repeatRate}%</span>
              </div>
            </div>

          </div>
        )}

        {/* TABS SELECT */}
        <div className="flex border-b border-slate-900 bg-slate-900/10 p-1 rounded-xl">
          {['users', 'games', 'communities', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm cursor-pointer capitalize transition-all ${
                activeTab === tab ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'communities' ? 'Groups' : tab}
              {tab === 'reports' && stats?.pendingReportsCount > 0 && (
                <span className="ml-1.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingReportsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-slate-905 bg-slate-900/10 border border-slate-900 rounded-3xl p-6">
          
          {/* 1. MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-2">Registered Users ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 border-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pr-2">Player</th>
                      <th className="pb-3 pr-2">Skill</th>
                      <th className="pb-3 pr-2">Neighborhood</th>
                      <th className="pb-3 pr-2">Games Preferred</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-slate-900 hover:bg-slate-950/20 text-slate-300">
                        <td className="py-4 pr-2 flex items-center space-x-3">
                          <img src={u.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={u.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-500">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-2 capitalize font-semibold">{u.skillLevel}</td>
                        <td className="py-4 pr-2 max-w-[150px] truncate" title={u.location?.address}>{u.location?.address.split(',')[0]}</td>
                        <td className="py-4 pr-2">
                          <div className="flex flex-wrap gap-1">
                            {u.preferredGames?.map(g => (
                              <span key={g._id} className="text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-900">{g.name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          {u.role === 'admin' ? (
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">System Admin</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                              title="Delete profile"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. MANAGE GAMES CRUD */}
          {activeTab === 'games' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Add Game Form */}
              <div className="lg:col-span-1 bg-slate-950/60 border border-slate-900 p-6 rounded-2xl">
                <h3 className="font-bold text-white text-sm mb-4 flex items-center space-x-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Create Game Category</span>
                </h3>
                <form onSubmit={handleAddGame} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Game Name</label>
                    <input
                      type="text"
                      required
                      value={newGameName}
                      onChange={(e) => setNewGameName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-1 focus:ring-indigo-500 w-full px-3 py-2.5 focus:outline-none"
                      placeholder="e.g. Table Tennis"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Category</label>
                    <select
                      value={newGameCategory}
                      onChange={(e) => setNewGameCategory(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white rounded-lg w-full px-3 py-2.5 focus:outline-none cursor-pointer"
                    >
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Icon Name (Lucide)</label>
                    <input
                      type="text"
                      value={newGameIcon}
                      onChange={(e) => setNewGameIcon(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white rounded-lg w-full px-3 py-2.5 focus:outline-none"
                      placeholder="e.g. trophy"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Description</label>
                    <textarea
                      value={newGameDesc}
                      onChange={(e) => setNewGameDesc(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white rounded-lg w-full px-3 py-2 focus:outline-none min-h-[60px]"
                      placeholder="Brief description..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors shadow"
                  >
                    Add Game
                  </button>
                </form>
              </div>

              {/* Games Table List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-white text-sm">Game Categories ({games.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Game</th>
                        <th className="pb-3 pr-2">Category</th>
                        <th className="pb-3 pr-2">Description</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map(g => (
                        <tr key={g._id} className="border-b border-slate-900 hover:bg-slate-950/20 text-slate-350">
                          <td className="py-3 pr-2 font-bold text-white flex items-center space-x-2">
                            <span className="bg-slate-950 p-1.5 rounded border border-slate-900 capitalize text-indigo-400 font-mono text-[10px]">{g.icon}</span>
                            <span>{g.name}</span>
                          </td>
                          <td className="py-3 pr-2 capitalize font-semibold">{g.category}</td>
                          <td className="py-3 pr-2 text-slate-400 max-w-[200px] truncate" title={g.description}>{g.description || 'No description'}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteGame(g._id)}
                              className="text-red-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 3. VERIFY COMMUNITIES */}
          {activeTab === 'communities' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-2">Communities & Groups ({communities.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pr-2">Community Name</th>
                      <th className="pb-3 pr-2">Organizer</th>
                      <th className="pb-3 pr-2">Linked Society/Venue</th>
                      <th className="pb-3 pr-2">Recurring Schedule</th>
                      <th className="pb-3 pr-2">Members</th>
                      <th className="pb-3 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communities.map(c => (
                      <tr key={c._id} className="border-b border-slate-900 hover:bg-slate-950/20 text-slate-350">
                        <td className="py-4 pr-2">
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-[9px] text-slate-500 line-clamp-1">{c.description}</span>
                        </td>
                        <td className="py-4 pr-2">{c.organizer?.name || 'Unknown'}</td>
                        <td className="py-4 pr-2 capitalize">{c.linkedSociety || 'Neighborhood'}</td>
                        <td className="py-4 pr-2 font-mono text-[10px] text-slate-400">{c.recurringSessionSchedule || 'Ad-hoc meetups'}</td>
                        <td className="py-4 pr-2 font-semibold text-indigo-400">{c.members?.length || 0}</td>
                        <td className="py-4 text-right">
                          {c.isVerified ? (
                            <button
                              onClick={() => handleVerifyCommunity(c._id, false)}
                              className="bg-emerald-950 text-emerald-400 border border-emerald-805 border-emerald-800 hover:bg-emerald-900 hover:text-white px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer inline-flex items-center space-x-1"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Verified</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyCommunity(c._id, true)}
                              className="bg-slate-950 border border-slate-800 text-slate-500 hover:bg-indigo-650 hover:bg-indigo-600 hover:text-white px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer inline-flex items-center space-x-1"
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                              <span>Unverified</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. USER REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-2">Flagged Content & Reports ({reports.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pr-2">Reported By</th>
                      <th className="pb-3 pr-2">Target Profile</th>
                      <th className="pb-3 pr-2">Report Reason</th>
                      <th className="pb-3 pr-2">Date Submitted</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id} className="border-b border-slate-900 hover:bg-slate-950/20 text-slate-350">
                        <td className="py-4 pr-2 font-semibold text-slate-200">{r.reportedBy?.name}</td>
                        <td className="py-4 pr-2">
                          {r.targetUser && (
                            <div>
                              <span className="font-bold text-slate-300 block">{r.targetUser.name}</span>
                              <span className="text-[9px] bg-rose-950/50 text-rose-400 border border-rose-900 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold">User Flag</span>
                            </div>
                          )}
                          {r.targetCommunity && (
                            <div>
                              <span className="font-bold text-slate-300 block">{r.targetCommunity.name}</span>
                              <span className="text-[9px] bg-amber-950/50 text-amber-400 border border-amber-900 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold">Group Flag</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-2 text-slate-400 max-w-[200px] whitespace-normal" style={{wordBreak: 'break-word'}}>{r.reason}</td>
                        <td className="py-4 pr-2 font-mono text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          {r.status === 'resolved' ? (
                            <span className="text-emerald-450 text-emerald-450 text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-3 py-1.5 rounded-xl font-bold inline-flex items-center space-x-1">
                              <Check className="h-3.5 w-3.5" />
                              <span>Resolved</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleResolveReport(r._id)}
                              className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1"
                            >
                              <span>Resolve</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500 text-xs">No misuse reports submitted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
