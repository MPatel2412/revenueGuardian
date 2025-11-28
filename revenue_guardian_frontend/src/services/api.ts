import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Your Django Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCarriers = async () => {
  const response = await api.get('carriers/');
  return response.data;
};

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | 'O';
  address?: string;
}

interface PolicyFormData {
  client: number;     // Client ID
  carrier: number;    // Carrier ID
  policy_number: string;
  policy_type: string;
  status: string;
  premium_amount: string; // Sending as string is safer for decimals
  sum_insured: string;
  start_date: string;
  end_date: string;
  renewal_date: string;
}

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

export const createClient = async (clientData: ClientFormData) => {
  // POST request to create a new client
  const response = await api.post('clients/', clientData);
  return response.data;
};

export const updateClient = async (clientId: number, clientData: ClientFormData) => {
  // PUT/PATCH request to update an existing client
  const response = await api.put(`clients/${clientId}/`, clientData);
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

export const createPolicy = async (data: PolicyFormData) => {
  const response = await api.post('policies/', data);
  return response.data;
};

export const updatePolicy = async (id: number, data: PolicyFormData) => {
  const response = await api.put(`policies/${id}/`, data);
  return response.data;
};

export default api;