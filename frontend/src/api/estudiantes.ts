import api from './axios';

export interface Estudiante {
  id: string;
  nombre: string;
  codigo: string;
  email: string;
  creadoEn?: string;
}

export const getEstudiantes = async (): Promise<Estudiante[]> => {
  const response = await api.get('/api/estudiantes');
  return response.data;
};

export const createEstudiante = async (data: Estudiante): Promise<Estudiante> => {
  const response = await api.post('/api/estudiantes', data);
  return response.data;
};

export const deleteEstudiante = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/estudiantes/${id}`);
  return response.data;
};
