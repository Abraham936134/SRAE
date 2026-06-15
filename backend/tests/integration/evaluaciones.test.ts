import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { RubricaRepo } from '../../src/infrastructure/db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../src/infrastructure/db/repositories/EvaluacionRepo';
import { Rubrica } from '../../src/domain/entities/Rubrica';
import { Criterio } from '../../src/domain/entities/Criterio';
import { Nivel } from '../../src/domain/entities/Nivel';

jest.mock('../../src/infrastructure/db/repositories/RubricaRepo');
jest.mock('../../src/infrastructure/db/repositories/EvaluacionRepo');

const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';

const generateToken = (rol: string = 'docente') => {
  return jwt.sign(
    { id: 'eval-uuid', nombre: 'Evaluator User', email: 'eval@test.com', rol },
    secret
  );
};

describe('Evaluaciones API Integration', () => {
  const rubricaId = '11111111-1111-1111-1111-111111111111';
  const criterioId = '22222222-2222-2222-2222-222222222222';
  const nivelId = '33333333-3333-3333-3333-333333333333';

  const mockRubrica = Rubrica.create(
    rubricaId,
    'Exposición',
    'Rúbrica de prueba',
    1,
    true,
    'user-uuid',
    [
      Criterio.create(criterioId, rubricaId, 'Contenido', 100, [
        Nivel.create(nivelId, criterioId, 'Excelente', 20.0),
      ]),
    ]
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/evaluaciones', () => {
    it('debe responder 401 si no se proporciona token', async () => {
      const res = await request(app).post('/api/evaluaciones').send({});
      expect(res.status).toBe(401);
    });

    it('debe responder 422 si la validación del body por Zod falla', async () => {
      const token = generateToken('docente');
      const payload = {
        rubricaId: 'invalid-uuid', // Invalid UUID format
        estudiante: '', // Empty name
        respuestas: [], // Empty responses
      };

      const res = await request(app)
        .post('/api/evaluaciones')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('Errores de validación de datos');
    });

    it('debe responder 201 y guardar la evaluación si los datos son correctos', async () => {
      const token = generateToken('docente');
      const payload = {
        rubricaId,
        estudiante: 'María Quispe',
        respuestas: [
          { criterioId, nivelId },
        ],
      };

      const findByIdSpy = jest.spyOn(RubricaRepo.prototype, 'findById').mockResolvedValue(mockRubrica);
      const saveSpy = jest.spyOn(EvaluacionRepo.prototype, 'save').mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/evaluaciones')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.estudiante).toBe('María Quispe');
      expect(res.body.notaFinal).toBe(20);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
