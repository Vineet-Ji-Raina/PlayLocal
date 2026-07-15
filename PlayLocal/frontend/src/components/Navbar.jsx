import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Trophy, Search, MessageSquare, Users, Shield, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(api.getCurrentUser());
  }, [location.pathname]);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-indigo-400 font-bold text-xl hover:text-indigo-300 transition-colors">
              <Trophy className="h-6 w-6" />
              <span>PlayLocal</span>
            </Link>

            {user && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link to="/search" className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/search') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Search className="h-4 w-4" /><span>Find Partners</span>
                </Link>
                <Link to="/requests" className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/requests') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <MessageSquare className="h-4 w-4" /><span>Play Requests</span>
                </Link>
                <Link to="/communities" className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/communities') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Users className="h-4 w-4" /><span>Communities</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-emerald-400 hover:bg-slate-800 transition-colors ${isActive('/admin') ? 'bg-emerald-900/50 border border-emerald-800' : ''}`}>
                    <Shield className="h-4 w-4" /><span>Admin Panel</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className={`flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors ${isActive('/profile') ? 'text-indigo-400 font-semibold' : ''}`}>
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="h-8 w-8 rounded-full border border-indigo-500 object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium cursor-pointer">
                  <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="flex items-center space-x-1 text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <LogIn className="h-4 w-4" /><span>Login</span>
                </Link>
                <Link to="/register" className="flex items-center space-x-1 bg-indigo-600 text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-md">
                  <UserPlus className="h-4 w-4" /><span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {user && (
        <div className="md:hidden flex justify-around bg-slate-950 border-t border-slate-900 py-2">
          <Link to="/search" className={`flex flex-col items-center text-xs ${isActive('/search') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
            <Search className="h-5 w-5" /><span>Search</span>
          </Link>
          <Link to="/requests" className={`flex flex-col items-center text-xs ${isActive('/requests') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
            <MessageSquare className="h-5 w-5" /><span>Requests</span>
          </Link>
          <Link to="/communities" className={`flex flex-col items-center text-xs ${isActive('/communities') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
            <Users className="h-5 w-5" /><span>Groups</span>
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className={`flex flex-col items-center text-xs ${isActive('/admin') ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              <Shield className="h-5 w-5" /><span>Admin</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
