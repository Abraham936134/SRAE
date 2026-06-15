import { AplicarEvaluacion, AplicarEvaluacionInput } from '../../src/application/evaluaciones/AplicarEvaluacion';
import { RubricaRepo } from '../../src/infrastructure/db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../src/infrastructure/db/repositories/EvaluacionRepo';
import { ValidationError } from '../../src/domain/errors/ValidationError';
import { Rubrica } from '../../src/domain/entities/Rubrica';
import { Criterio } from '../../src/domain/entities/Criterio';
import { Nivel } from '../../src/domain/entities/Nivel';
import { Evaluacion } from '../../src/domain/entities/Evaluacion';

jest.mock('../../src/infrastructure/db/repositories/RubricaRepo');
jest.mock('../../src/infrastructure/db/repositories/EvaluacionRepo');

describe('AplicarEvaluacion Use Case', () => {
  let rubricaRepo: jest.Mocked<RubricaRepo>;
  let evaluacionRepo: jest.Mocked<EvaluacionRepo>;
  let aplicarEvaluacion: AplicarEvaluacion;

  const mockRubricaId = 'rubrica-uuid';
  const criterio1Id = 'criterio-1-uuid';
  const criterio2Id = 'criterio-2-uuid';
  const nivel1Id = 'nivel-1-uuid';
  const nivel2Id = 'nivel-2-uuid';
  const nivel3Id = 'nivel-3-uuid';
  const nivel4Id = 'nivel-4-uuid';

  const mockRubrica = Rubrica.create(
    mockRubricaId,
    'Exposición',
    'Rúbrica de prueba',
    1,
    true,
    'user-uuid',
    [
      Criterio.create(criterio1Id, mockRubricaId, 'Contenido', 60, [
        Nivel.create(nivel1Id, criterio1Id, 'Deficiente', 12.35),
        Nivel.create(nivel2Id, criterio1Id, 'Excelente', 20.0),
      ]),
      Criterio.create(criterio2Id, mockRubricaId, 'Presentación', 40, [
        Nivel.create(nivel3Id, criterio2Id, 'Regular', 7.89),
        Nivel.create(nivel4Id, criterio2Id, 'Excelente', 15.0),
      ]),
    ]
  );

  beforeEach(() => {
    rubricaRepo = new RubricaRepo() as jest.Mocked<RubricaRepo>;
    evaluacionRepo = new EvaluacionRepo() as jest.Mocked<EvaluacionRepo>;
    aplicarEvaluacion = new AplicarEvaluacion(rubricaRepo, evaluacionRepo);
  });

  it('debe aplicar una evaluación calculando y redondeando la nota final a 2 decimales', async () => {
    rubricaRepo.findById.mockResolvedValue(mockRubrica);
    evaluacionRepo.save.mockResolvedValue(undefined);

    const input: AplicarEvaluacionInput = {
      rubricaId: mockRubricaId,
      estudiante: 'Juan Pérez',
      evaluadorId: 'eval-uuid',
      respuestas: [
        { criterioId: criterio1Id, nivelId: nivel1Id }, // 12.35 pts (60% weight) -> 12.35 * 60 / 100 = 7.41
        { criterioId: criterio2Id, nivelId: nivel3Id }, // 7.89 pts (40% weight) -> 7.89 * 40 / 100 = 3.156
        // Total = 7.41 + 3.156 = 10.566 -> Rounded to 2 decimals = 10.57
      ],
    };

    const result = await aplicarEvaluacion.execute(input);

    expect(result).toBeInstanceOf(Evaluacion);
    expect(result.estudiante).toBe('Juan Pérez');
    expect(result.notaFinal).toBe(10.57);
    expect(evaluacionRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar ValidationError si falta evaluar algún criterio de la rúbrica', async () => {
    rubricaRepo.findById.mockResolvedValue(mockRubrica);

    const input: AplicarEvaluacionInput = {
      rubricaId: mockRubricaId,
      estudiante: 'Juan Pérez',
      evaluadorId: 'eval-uuid',
      respuestas: [
        { criterioId: criterio1Id, nivelId: nivel1Id }, // Missing criterion 2!
      ],
    };

    await expect(aplicarEvaluacion.execute(input)).rejects.toThrow(ValidationError);
    await expect(aplicarEvaluacion.execute(input)).rejects.toThrow('Falta evaluar el criterio "Presentación"');
    expect(evaluacionRepo.save).not.toHaveBeenCalled();
  });

  it('debe lanzar ValidationError si el nivel seleccionado no pertenece al criterio', async () => {
    rubricaRepo.findById.mockResolvedValue(mockRubrica);

    const input: AplicarEvaluacionInput = {
      rubricaId: mockRubricaId,
      estudiante: 'Juan Pérez',
      evaluadorId: 'eval-uuid',
      respuestas: [
        { criterioId: criterio1Id, nivelId: nivel3Id }, // nivel3 belongs to criterio2!
        { criterioId: criterio2Id, nivelId: nivel4Id },
      ],
    };

    await expect(aplicarEvaluacion.execute(input)).rejects.toThrow(ValidationError);
    expect(evaluacionRepo.save).not.toHaveBeenCalled();
  });
});
