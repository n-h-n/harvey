// src/services/authService.tsx
import {api} from './api';

export const AuthService = {
  // Log in user and obtain an access token
  login: (username: string) => api.post('/login', { username }),
};
