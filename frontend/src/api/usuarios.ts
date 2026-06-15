/* eslint-disable */
import api from './axios';

export const loginUser = async (credentials: any) => {
  const response = await api.post('/api/usuarios/login', credentials);
  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await api.post('/api/usuarios/register', data);
  return response.data;
};
