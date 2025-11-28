import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Your Django Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Add Token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getClientsList = async () => {
  // Fetches all clients for the logged-in agent
  const response = await api.get('clients/'); 
  return response.data;
};

export const getClient = async (id: string) => {
  const response = await api.get(`clients/${id}/`);
  return response.data;
};

export const getClientPolicies = async (clientId: string) => {
  const response = await api.get(`policies/?client_id=${clientId}`);
  return response.data;
};

export const getPolicy = async (id: string) => {
  // Correct Path: /api/policies/5/
  const response = await api.get(`policies/${id}/`);
  return response.data;
};

export const getPolicyList = async () => {
  // Fetches all policies belonging to the currently logged-in agent
  const response = await api.get(`policies/`); 
  return response.data;
};

export default api;