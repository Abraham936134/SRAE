"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelGenerator = void 0;
class ExcelGenerator {
    generate(report) {
        // Generate CSV contents (compatible with Excel)
        const rows = [];
        // Title & Metadata
        rows.push(`"Reporte Grupal - Rúbrica: ${report.tituloRubrica}"`);
        rows.push(`"ID de Rúbrica:","${report.rubricaId}"`);
        rows.push(`"Fecha de Emisión:","${new Date().toLocaleDateString()}"`);
        rows.push('');
        // General Metrics
        rows.push('"Métrica","Valor"');
        rows.push(`"Total Evaluados","${report.totalEvaluaciones}"`);
        rows.push(`"Promedio General","${report.promedioGeneral}"`);
        rows.push(`"Nota Máxima","${report.notaMaxima}"`);
        rows.push(`"Nota Mínima","${report.notaMinima}"`);
        rows.push('');
        // Criteria stats Table
        rows.push('"Criterio","Ponderacion (%)","Promedio Puntos"');
        report.criteriosStats.forEach((c) => {
            // Escape quotes in description
            const escapedDesc = c.descripcion.replace(/"/g, '""');
            rows.push(`"${escapedDesc}","${c.ponderacion}","${c.promedioPuntos}"`);
        });
        return Buffer.from(rows.join('\n'), 'utf-8');
    }
}
exports.ExcelGenerator = ExcelGenerator;
