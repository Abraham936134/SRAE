/* eslint-disable */
import api from './axios';
import { Rubrica } from '../types';

export const getRubricas = async (): Promise<Rubrica[]> => {
  const response = await api.get('/api/rubricas');
  return response.data;
};

export const getRubricaById = async (id: string): Promise<Rubrica> => {
  const response = await api.get(`/api/rubricas/${id}`);
  return response.data;
};

export const createRubrica = async (data: any): Promise<Rubrica> => {
  const response = await api.post('/api/rubricas', data);
  return response.data;
};

export const updateRubrica = async (id: string, data: any): Promise<Rubrica> => {
  const response = await api.put(`/api/rubricas/${id}`, data);
  return response.data;
};

export const cloneRubrica = async (originalId: string): Promise<Rubrica> => {
  const response = await api.post('/api/rubricas/clone', { originalId });
  return response.data;
};

export const archiveRubrica = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/rubricas/${id}`);
  return response.data;
};

export const getRubricaHistory = async (id: string): Promise<any[]> => {
  const response = await api.get(`/api/rubricas/${id}/historial`);
  return response.data;
};
