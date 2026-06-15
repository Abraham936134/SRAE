import { CrearRubrica, CrearRubricaInput } from '../../src/application/rubricas/CrearRubrica';
import { RubricaRepo } from '../../src/infrastructure/db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../src/infrastructure/db/repositories/EvaluacionRepo';
import { ValidationError } from '../../src/domain/errors/ValidationError';
import { RubricaEnUsoError } from '../../src/domain/errors/RubricaEnUsoError';
import { Rubrica } from '../../src/domain/entities/Rubrica';

jest.mock('../../src/infrastructure/db/repositories/RubricaRepo');
jest.mock('../../src/infrastructure/db/repositories/EvaluacionRepo');

describe('CrearRubrica Use Case', () => {
  let rubricaRepo: jest.Mocked<RubricaRepo>;
  let evaluacionRepo: jest.Mocked<EvaluacionRepo>;
  let crearRubrica: CrearRubrica;

  beforeEach(() => {
    rubricaRepo = new RubricaRepo() as jest.Mocked<RubricaRepo>;
    evaluacionRepo = new EvaluacionRepo() as jest.Mocked<EvaluacionRepo>;
    crearRubrica = new CrearRubrica(rubricaRepo, evaluacionRepo);
  });

  it('debe crear una rúbrica exitosamente si la suma de ponderaciones es exactamente 100%', async () => {
    const input: CrearRubricaInput = {
      titulo: 'Exposición Final',
      descripcion: 'Rúbrica para evaluar la exposición final',
      creadoPor: 'user-uuid',
      criterios: [
        {
          descripcion: 'Contenido',
          ponderacion: 60,
          niveles: [
            { descripcion: 'Excelente', puntos: 20 },
            { descripcion: 'Deficiente', puntos: 5 },
          ],
        },
        {
          descripcion: 'Presentación',
          ponderacion: 40,
          niveles: [
            { descripcion: 'Excelente', puntos: 20 },
            { descripcion: 'Deficiente', puntos: 5 },
          ],
        },
      ],
    };

    rubricaRepo.save.mockResolvedValue(undefined);

    const result = await crearRubrica.execute(input);

    expect(result).toBeInstanceOf(Rubrica);
    expect(result.titulo).toBe('Exposición Final');
    expect(result.version).toBe(1);
    expect(rubricaRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar ValidationError si la suma de ponderaciones es diferente de 100%', async () => {
    const input: CrearRubricaInput = {
      titulo: 'Proyecto',
      descripcion: 'Suma menor a 100%',
      creadoPor: 'user-uuid',
      criterios: [
        {
          descripcion: 'Criterio 1',
          ponderacion: 50,
          niveles: [{ descripcion: 'Excelente', puntos: 20 }],
        },
        {
          descripcion: 'Criterio 2',
          ponderacion: 30, // Sum = 80
          niveles: [{ descripcion: 'Excelente', puntos: 20 }],
        },
      ],
    };

    await expect(crearRubrica.execute(input)).rejects.toThrow(ValidationError);
    await expect(crearRubrica.execute(input)).rejects.toThrow(
      'La suma de ponderaciones de los criterios debe ser exactamente 100%'
    );
    expect(rubricaRepo.save).not.toHaveBeenCalled();
  });

  it('debe lanzar RubricaEnUsoError al intentar modificar una rúbrica que ya tiene evaluaciones', async () => {
    const existingRubric = Rubrica.create(
      'rubric-uuid',
      'Exposición',
      'Original',
      1,
      true,
      'user-uuid',
      []
    );

    rubricaRepo.findById.mockResolvedValue(existingRubric);
    evaluacionRepo.hasEvaluaciones.mockResolvedValue(true); // rubric already in use!

    const input: CrearRubricaInput = {
      id: 'rubric-uuid',
      titulo: 'Exposición Modificada',
      descripcion: 'Intento de modificar',
      creadoPor: 'user-uuid',
      criterios: [],
    };

    await expect(crearRubrica.execute(input)).rejects.toThrow(RubricaEnUsoError);
    expect(rubricaRepo.save).not.toHaveBeenCalled();
  });
});
