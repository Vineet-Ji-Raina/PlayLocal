"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trophy, Users, MapPin, Calendar, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(api.getCurrentUser());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/80 border border-indigo-800 rounded-full px-4 py-1.5 text-indigo-400 text-sm font-semibold mb-6 animate-pulse">
            <Trophy className="h-4 w-4" />
            <span>Finding Partners Made Simple</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Find Nearby Partners for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Indoor & Outdoor Games
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-400 mb-10">
            Ditch the screen. Connect with players in your neighborhood, society clubhouses, or local grounds. Play Chess, Badminton, Carrom, Table Tennis, and more.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link
                href="/search"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer text-lg"
              >
                Find Players Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 font-semibold px-8 py-4 rounded-xl transition-all cursor-pointer text-lg"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How PlayLocal Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Skip the coordination hassle. Find partners who match your game, availability, and skill level in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-all group">
              <div className="h-12 w-12 bg-indigo-900/40 border border-indigo-700 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Setup Onboarding</h3>
              <p className="text-slate-400">
                Select your favorite indoor/outdoor games, define your skill level, and map your playing availability.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-all group">
              <div className="h-12 w-12 bg-indigo-900/40 border border-indigo-700 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Discover Nearby</h3>
              <p className="text-slate-400">
                Filter local players using our interactive Leaflet map. Adjust radius settings to find partners right inside your housing society or neighborhood.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-all group">
              <div className="h-12 w-12 bg-indigo-900/40 border border-indigo-700 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Propose Match</h3>
              <p className="text-slate-400">
                Send a play request for a clubhouse or ground. Once accepted, head over, play, and log your results in your match history!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community / Clubhouses Highlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-900/50 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <span className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2 block">Society & Club Groups</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Join or Create a Local Game Circle
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Connect with residential sports communities, table tennis groups, or society carrom leagues. Manage member lists and set recurring weekend play schedules easily.
              </p>
              <div className="flex items-center space-x-4 text-slate-300 text-sm">
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span>Admin Verified Groups</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <span>Weekly Routines</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Link
                href="/communities"
                className="w-full md:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Browse Communities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 bg-slate-950 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Trophy className="h-5 w-5 text-indigo-500" />
            <span className="font-semibold">PlayLocal © 2026</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>for active neighborhoods</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
