"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Users, Plus, ShieldCheck, MapPin, Calendar, X, AlertCircle, Sparkles } from 'lucide-react';

export default function Communities() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Community state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [linkedSociety, setLinkedSociety] = useState('');
  const [schedule, setSchedule] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchCommunities = async () => {
    try {
      const data = await api.getCommunities();
      setCommunities(data);
    } catch (err) {
      setError(err.message || 'Failed to load communities');
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
    fetchCommunities();
  }, [router]);

  const handleJoinLeave = async (community) => {
    const isMember = community.members?.some(m => m._id === currentUser?._id);
    const isOrganizer = community.organizer?._id === currentUser?._id;

    if (isOrganizer) {
      alert('You are the organizer of this group and cannot leave it.');
      return;
    }

    try {
      if (isMember) {
        await api.leaveCommunity(community._id);
      } else {
        await api.joinCommunity(community._id);
      }
      fetchCommunities();
    } catch (err) {
      alert(err.message || 'Failed to join/leave group');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    if (!name || !description) {
      setCreateError('Name and description are required.');
      setCreateLoading(false);
      return;
    }

    try {
      await api.createCommunity({
        name,
        description,
        linkedSociety,
        recurringSessionSchedule: schedule
      });
      
      // Reset form
      setName('');
      setDescription('');
      setLinkedSociety('');
      setSchedule('');
      setIsCreateOpen(false);
      
      // Refresh list
      fetchCommunities();
    } catch (err) {
      setCreateError(err.message || 'Failed to create community');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 max-w-6xl mx-auto w-full">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Users className="h-8 w-8 text-indigo-400" />
              <span>Society & Neighborhood Groups</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Join residential recreational communities or schedule weekly recurring games in your local clubhouse.
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </button>
        </div>

        {/* List content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading community groups...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/65 p-4 rounded-2xl text-red-300 flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-20 border border-slate-900 rounded-3xl bg-slate-900/10 space-y-3">
            <Users className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No communities found</h3>
            <p className="text-xs text-slate-500">Be the first to bootstrap a group in your residential complex!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communities.map((c) => {
              const isMember = c.members?.some(m => m._id === currentUser?._id);
              const isOrganizer = c.organizer?._id === currentUser?._id;

              return (
                <div
                  key={c._id}
                  className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Upper details */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
                          <span>{c.name}</span>
                          {c.isVerified && (
                            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 fill-emerald-950 shrink-0" title="Verified by admin" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-500">Organizer: {c.organizer?.name}</p>
                      </div>

                      <div className="flex items-center space-x-1 text-[11px] font-semibold bg-slate-950/60 text-indigo-400 border border-slate-905 px-2.5 py-1 rounded-full shrink-0">
                        <Users className="h-3 w-3" />
                        <span>{c.members?.length || 0} members</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {c.description}
                    </p>

                    {/* Meta location and schedule */}
                    <div className="space-y-2 pt-2 text-[10px] text-slate-500">
                      {c.linkedSociety && (
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
                          <span>Venue: {c.linkedSociety}</span>
                        </div>
                      )}
                      {c.recurringSessionSchedule && (
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
                          <span>Schedule: {c.recurringSessionSchedule}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center gap-4">
                    {isOrganizer ? (
                      <span className="text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-900 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                        Your Group
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinLeave(c)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                          isMember
                            ? 'bg-slate-950 border-slate-800 text-red-400 hover:bg-slate-900'
                            : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {isMember ? 'Leave Group' : 'Join Group'}
                      </button>
                    )}

                    {isMember && (
                      <span className="text-[10px] text-slate-500 italic">You are a member</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Community Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
                <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <span>Create Playing Group</span>
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="p-6 space-y-4">
                {createError && (
                  <div className="bg-red-950/40 border border-red-900 text-red-300 p-3 rounded-xl text-xs">
                    <span>{createError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full px-3.5 py-3 text-sm focus:outline-none"
                    placeholder="e.g. Bandra Chess Club"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full px-3.5 py-2 text-sm focus:outline-none min-h-[90px]"
                    placeholder="Describe your community, game types, equipment available, etc..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Linked Society / Venue</label>
                  <input
                    type="text"
                    value={linkedSociety}
                    onChange={(e) => setLinkedSociety(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full px-3.5 py-3 text-sm focus:outline-none"
                    placeholder="e.g. Greenwood Clubhouse"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Recurring Sessions Schedule</label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 w-full px-3.5 py-3 text-sm focus:outline-none"
                    placeholder="e.g. Saturdays 4:00 PM - 6:00 PM"
                  />
                </div>

                <div className="flex space-x-3 pt-4 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1 py-3 px-4 bg-slate-900 border border-slate-850 border-slate-800 text-slate-400 hover:text-white text-sm rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {createLoading ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
