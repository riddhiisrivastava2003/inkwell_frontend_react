import axios from 'axios';
import { API_TIMEOUT } from '../../utils/constants';
import { clearAuthStorage, getStoredToken } from '../../utils/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api-gw',
  timeout: API_TIMEOUT,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStorage();
    }
    return Promise.reject(error);
  },
);

export default apiClient;

