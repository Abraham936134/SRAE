/* eslint-disable */
import api from './axios';
import { Evaluacion } from '../types';

export const applyEvaluacion = async (data: any): Promise<Evaluacion> => {
  const response = await api.post('/api/evaluaciones', data);
  return response.data;
};

export const updateEvaluacion = async (id: string, data: any): Promise<Evaluacion> => {
  const response = await api.put(`/api/evaluaciones/${id}`, data);
  return response.data;
};

export const deleteEvaluacion = async (id: string): Promise<void> => {
  await api.delete(`/api/evaluaciones/${id}`);
};
