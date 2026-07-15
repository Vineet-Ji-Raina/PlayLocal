const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(res);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(res);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Users & Profiles
  getProfile: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (id, profileData) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await handleResponse(res);
    // If updating own profile, sync local storage user
    if (typeof window !== 'undefined') {
      const curUser = localStorage.getItem('user');
      if (curUser) {
        const parsed = JSON.parse(curUser);
        if (parsed._id === id) {
          const updatedLocalUser = { ...parsed, ...data };
          localStorage.setItem('user', JSON.stringify(updatedLocalUser));
        }
      }
    }
    return data;
  },

  searchUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const res = await fetch(`${API_URL}/users/search?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Games
  getGames: async () => {
    const res = await fetch(`${API_URL}/games`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createGame: async (gameData) => {
    const res = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(gameData),
    });
    return handleResponse(res);
  },

  updateGame: async (id, gameData) => {
    const res = await fetch(`${API_URL}/games/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(gameData),
    });
    return handleResponse(res);
  },

  deleteGame: async (id) => {
    const res = await fetch(`${API_URL}/games/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Play Requests
  createPlayRequest: async (requestData) => {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(res);
  },

  updatePlayRequest: async (id, status) => {
    const res = await fetch(`${API_URL}/requests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  getPlayHistory: async (userId) => {
    const res = await fetch(`${API_URL}/requests/history/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Communities
  getCommunities: async () => {
    const res = await fetch(`${API_URL}/communities`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getCommunity: async (id) => {
    const res = await fetch(`${API_URL}/communities/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createCommunity: async (communityData) => {
    const res = await fetch(`${API_URL}/communities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(communityData),
    });
    return handleResponse(res);
  },

  joinCommunity: async (id) => {
    const res = await fetch(`${API_URL}/communities/${id}/join`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  leaveCommunity: async (id) => {
    const res = await fetch(`${API_URL}/communities/${id}/leave`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Features
  getAdminUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  submitReport: async (reportData) => {
    const res = await fetch(`${API_URL}/admin/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reportData),
    });
    return handleResponse(res);
  },

  getAdminReports: async () => {
    const res = await fetch(`${API_URL}/admin/reports`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  resolveReport: async (id, status) => {
    const res = await fetch(`${API_URL}/admin/reports/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  verifyCommunity: async (id, isVerified) => {
    const res = await fetch(`${API_URL}/admin/communities/${id}/verify`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isVerified }),
    });
    return handleResponse(res);
  },
};
