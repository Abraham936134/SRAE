import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { RubricaRepo } from '../../db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../db/repositories/EvaluacionRepo';
import { GenerarReporteGrupal } from '../../../application/reportes/GenerarReporteGrupal';
import { PdfGenerator } from '../../reports/pdfGenerator';
import { ExcelGenerator } from '../../reports/excelGenerator';
import { ValidationError } from '../../../domain/errors/ValidationError';

const rubricaRepo = new RubricaRepo();
const evaluacionRepo = new EvaluacionRepo();
const pdfGen = new PdfGenerator();
const excelGen = new ExcelGenerator();

const handleError = (error: any, res: Response) => {
  if (error instanceof ValidationError) {
    return res.status(404).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

export class ReportesController {
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rubricaId } = req.params;
      const useCase = new GenerarReporteGrupal(rubricaRepo, evaluacionRepo);
      const stats = await useCase.execute(rubricaId);
      res.status(200).json(stats);
    } catch (error) {
      handleError(error, res);
    }
  }

  async exportPDF(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rubricaId } = req.params;
      const useCase = new GenerarReporteGrupal(rubricaRepo, evaluacionRepo);
      const stats = await useCase.execute(rubricaId);
      
      const buffer = await pdfGen.generate(stats);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-grupal-${rubricaId}.pdf"`);
      res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      handleError(error, res);
    }
  }

  async exportExcel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rubricaId } = req.params;
      const useCase = new GenerarReporteGrupal(rubricaRepo, evaluacionRepo);
      const stats = await useCase.execute(rubricaId);
      
      const buffer = await excelGen.generate(stats);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-grupal-${rubricaId}.xlsx"`);
      res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      handleError(error, res);
    }
  }
}
