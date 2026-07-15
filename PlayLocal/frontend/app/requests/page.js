"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Calendar, MapPin, Trophy, CheckCircle, XCircle, Clock, Check, X, ShieldAlert, Award } from 'lucide-react';

export default function Requests() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', 'history'

  const fetchRequests = async (userId) => {
    try {
      const data = await api.getPlayHistory(userId);
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to load requests history');
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
    fetchRequests(user._id);
  }, [router]);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await api.updatePlayRequest(requestId, status);
      // reload requests
      if (currentUser) {
        fetchRequests(currentUser._id);
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  // Filter requests based on tabs
  const receivedRequests = requests.filter(r => r.receiver?._id === currentUser?._id && r.status === 'pending');
  const sentRequests = requests.filter(r => r.sender?._id === currentUser?._id && r.status === 'pending');
  const historyRequests = requests.filter(r => 
    r.status !== 'pending' && 
    (r.sender?._id === currentUser?._id || r.receiver?._id === currentUser?._id)
  );

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 max-w-4xl mx-auto w-full">
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-indigo-400" />
            <span>Play Requests & Matchmaker</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your play invitations, confirm matches, and look up your gaming history.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-900 bg-slate-900/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm cursor-pointer transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'received' ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Received</span>
            {receivedRequests.length > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {receivedRequests.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm cursor-pointer transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'sent' ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Sent</span>
            {sentRequests.length > 0 && (
              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {sentRequests.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm cursor-pointer transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'history' ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Match History</span>
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading match data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-2xl text-red-300 flex items-start space-x-2 text-sm">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* RECEIVED TAB */}
            {activeTab === 'received' && (
              receivedRequests.length === 0 ? (
                <div className="text-center py-20 border border-slate-900 rounded-3xl bg-slate-900/10 space-y-2">
                  <Clock className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
                  <h3 className="font-bold text-white text-sm">No pending requests</h3>
                  <p className="text-xs text-slate-500">Invitations received from local players will show up here.</p>
                </div>
              ) : (
                receivedRequests.map(r => (
                  <div key={r._id} className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 hover:border-slate-850 transition-all flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <img src={r.sender?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={r.sender?.name} className="h-12 w-12 rounded-full object-cover border border-slate-800" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{r.sender?.name}</h4>
                          <span className="text-[10px] bg-indigo-950 border border-indigo-800 text-indigo-400 font-semibold px-2 py-0.5 rounded-full capitalize">{r.game?.name}</span>
                        </div>
                        <p className="text-xs text-slate-400">{r.sender?.bio || 'Let\'s connect for a game!'}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-[10px] text-slate-500 pt-2">
                          <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" /> {formatTime(r.proposedTime)}</span>
                          <span className="flex items-center capitalize"><MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" /> {r.proposedLocation?.address} ({r.proposedLocation?.type})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(r._id, 'declined')}
                        className="flex-1 md:flex-none px-4 py-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(r._id, 'accepted')}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-indigo-600/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Accept Match</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* SENT TAB */}
            {activeTab === 'sent' && (
              sentRequests.length === 0 ? (
                <div className="text-center py-20 border border-slate-900 rounded-3xl bg-slate-900/10 space-y-2">
                  <Clock className="h-8 w-8 text-slate-600 mx-auto" />
                  <h3 className="font-bold text-white text-sm">No sent requests</h3>
                  <p className="text-xs text-slate-500">Invitations you send to local players will appear here.</p>
                </div>
              ) : (
                sentRequests.map(r => (
                  <div key={r._id} className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 hover:border-slate-850 transition-all flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <img src={r.receiver?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={r.receiver?.name} className="h-12 w-12 rounded-full object-cover border border-slate-800" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-300 text-sm">Sent to {r.receiver?.name}</h4>
                          <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full capitalize">{r.game?.name}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-[10px] text-slate-500 pt-2">
                          <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" /> {formatTime(r.proposedTime)}</span>
                          <span className="flex items-center capitalize"><MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {r.proposedLocation?.address} ({r.proposedLocation?.type})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-amber-500 bg-amber-950/20 border border-amber-900/50 px-3 py-1.5 rounded-xl shrink-0 font-semibold">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Pending Confirmation</span>
                    </div>
                  </div>
                ))
              )
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              historyRequests.length === 0 ? (
                <div className="text-center py-20 border border-slate-900 rounded-3xl bg-slate-900/10 space-y-2">
                  <Award className="h-8 w-8 text-slate-600 mx-auto" />
                  <h3 className="font-bold text-white text-sm">No match history</h3>
                  <p className="text-xs text-slate-500">Confirmed or completed matches will log here.</p>
                </div>
              ) : (
                historyRequests.map(r => {
                  const isSender = r.sender?._id === currentUser?._id;
                  const partner = isSender ? r.receiver : r.sender;

                  return (
                    <div key={r._id} className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 hover:border-slate-850 transition-all flex flex-col justify-between">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <img src={partner?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={partner?.name} className="h-12 w-12 rounded-full object-cover border border-slate-800" />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-white text-sm">
                                {isSender ? `Match with ${partner?.name}` : `Invitation from ${partner?.name}`}
                              </h4>
                              <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-full capitalize">{r.game?.name}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-[10px] text-slate-500 pt-2">
                              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" /> {formatTime(r.proposedTime)}</span>
                              <span className="flex items-center capitalize"><MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {r.proposedLocation?.address} ({r.proposedLocation?.type})</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges and completion triggers */}
                        <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto justify-end">
                          {r.status === 'accepted' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(r._id, 'completed')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors shadow-md shadow-emerald-600/10"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Mark Completed</span>
                              </button>
                              <span className="text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-3 py-1.5 rounded-xl font-bold">
                                Accepted
                              </span>
                            </>
                          )}
                          
                          {r.status === 'completed' && (
                            <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Completed</span>
                            </span>
                          )}

                          {r.status === 'declined' && (
                            <span className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Declined</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display Contact Info if Accepted/Completed */}
                      {(r.status === 'accepted' || r.status === 'completed') && partner && (
                        <div className="mt-4 pt-4 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 bg-slate-950/30 p-3 rounded-xl gap-2 border border-slate-900/50">
                          <span className="font-semibold text-slate-300">Contact Partner:</span>
                          <span className="text-indigo-400 select-all font-mono">{partner.email}</span>
                          <span className="hidden sm:inline text-slate-600">|</span>
                          <span className="italic text-[10px]">Reach out via email to finalize logistics!</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

          </div>
        )}
      </div>
    </div>
  );
}
