"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesController = void 0;
const RubricaRepo_1 = require("../../db/repositories/RubricaRepo");
const EvaluacionRepo_1 = require("../../db/repositories/EvaluacionRepo");
const GenerarReporteGrupal_1 = require("../../../application/reportes/GenerarReporteGrupal");
const pdfGenerator_1 = require("../../reports/pdfGenerator");
const excelGenerator_1 = require("../../reports/excelGenerator");
const ValidationError_1 = require("../../../domain/errors/ValidationError");
const rubricaRepo = new RubricaRepo_1.RubricaRepo();
const evaluacionRepo = new EvaluacionRepo_1.EvaluacionRepo();
const pdfGen = new pdfGenerator_1.PdfGenerator();
const excelGen = new excelGenerator_1.ExcelGenerator();
const handleError = (error, res) => {
    if (error instanceof ValidationError_1.ValidationError) {
        return res.status(404).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
};
class ReportesController {
    async getStats(req, res) {
        try {
            const { rubricaId } = req.params;
            const useCase = new GenerarReporteGrupal_1.GenerarReporteGrupal(rubricaRepo, evaluacionRepo);
            const stats = await useCase.execute(rubricaId);
            res.status(200).json(stats);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async exportPDF(req, res) {
        try {
            const { rubricaId } = req.params;
            const useCase = new GenerarReporteGrupal_1.GenerarReporteGrupal(rubricaRepo, evaluacionRepo);
            const stats = await useCase.execute(rubricaId);
            const buffer = pdfGen.generate(stats);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="reporte-grupal-${rubricaId}.txt"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async exportExcel(req, res) {
        try {
            const { rubricaId } = req.params;
            const useCase = new GenerarReporteGrupal_1.GenerarReporteGrupal(rubricaRepo, evaluacionRepo);
            const stats = await useCase.execute(rubricaId);
            const buffer = excelGen.generate(stats);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="reporte-grupal-${rubricaId}.csv"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            handleError(error, res);
        }
    }
}
exports.ReportesController = ReportesController;
