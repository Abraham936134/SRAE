import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { RubricaRepo } from '../../src/infrastructure/db/repositories/RubricaRepo';

jest.mock('../../src/infrastructure/db/repositories/RubricaRepo');
jest.mock('../../src/infrastructure/db/repositories/EvaluacionRepo');

const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';

const generateToken = (rol: string = 'docente') => {
  return jwt.sign(
    { id: 'admin-uuid', nombre: 'Admin User', email: 'admin@test.com', rol },
    secret
  );
};

describe('Rubricas API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/rubricas', () => {
    it('debe responder 401 si no se provee token', async () => {
      const res = await request(app).get('/api/rubricas');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Token no proporcionado');
    });

    it('debe responder 200 y la lista de rúbricas activas con un token válido', async () => {
      const token = generateToken('auxiliar');
      const findAllActiveSpy = jest.spyOn(RubricaRepo.prototype, 'findAllActive').mockResolvedValue([]);

      const res = await request(app)
        .get('/api/rubricas')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(findAllActiveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/rubricas', () => {
    it('debe responder 403 si el usuario tiene rol auxiliar (permisos insuficientes)', async () => {
      const token = generateToken('auxiliar');
      const payload = {
        titulo: 'Trabajo Escrito',
        descripcion: 'Evaluar redacción',
        criterios: [],
      };

      const res = await request(app)
        .post('/api/rubricas')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Permisos insuficientes');
    });

    it('debe responder 422 si falla la validación de Zod', async () => {
      const token = generateToken('docente');
      const payload = {
        titulo: 'A', // Too short (zod rule min 3)
        descripcion: 'Test',
        criterios: [], // Empty criteria (zod rule min 1)
      };

      const res = await request(app)
        .post('/api/rubricas')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('Errores de validación de datos');
      expect(res.body.details.length).toBeGreaterThanOrEqual(2);
    });

    it('debe responder 201 y crear la rúbrica si el rol es docente y los datos son correctos', async () => {
      const token = generateToken('docente');
      const payload = {
        titulo: 'Proyecto de Integración',
        descripcion: 'Rúbrica para proyectos',
        criterios: [
          {
            descripcion: 'Código Fuente',
            ponderacion: 100,
            niveles: [
              { descripcion: 'Bueno', puntos: 20 },
            ],
          },
        ],
      };

      const saveSpy = jest.spyOn(RubricaRepo.prototype, 'save').mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/rubricas')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.titulo).toBe('Proyecto de Integración');
      expect(res.body.version).toBe(1);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
