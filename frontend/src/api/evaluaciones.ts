/* eslint-disable */
import api from './axios';
import { Evaluacion } from '../types';

export const applyEvaluacion = async (data: any): Promise<Evaluacion> => {
  const response = await api.post('/api/evaluaciones', data);
  return response.data;
};
