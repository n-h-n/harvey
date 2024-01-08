// src/services/api.tsx
import axios, {AxiosInstance} from 'axios';

export const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://dataroom-backend.dataroom.svc.cluster.local:8000',  headers: {
    'Content-Type': 'application/json',
    // Add any additional headers if needed
  },
});
