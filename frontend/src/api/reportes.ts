import api from './axios';
import { ReporteGrupal } from '../types';

export const getReporteStats = async (rubricaId: string): Promise<ReporteGrupal> => {
  const response = await api.get(`/api/reportes/${rubricaId}/stats`);
  return response.data;
};

export const exportReportePDF = async (rubricaId: string): Promise<Blob> => {
  const response = await api.get(`/api/reportes/${rubricaId}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

export const exportReporteExcel = async (rubricaId: string): Promise<Blob> => {
  const response = await api.get(`/api/reportes/${rubricaId}/excel`, {
    responseType: 'blob',
  });
  return response.data;
};
