"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelGenerator = void 0;
const exceljs_1 = require("exceljs");
class ExcelGenerator {
    async generate(report) {
        const workbook = new exceljs_1.Workbook();
        const worksheet = workbook.addWorksheet('Reporte Académico');
        // Styling configuration
        const primaryFont = { name: 'Arial', family: 2, size: 10 };
        const titleFont = { name: 'Arial', family: 2, size: 14, bold: true, color: { argb: '1E3A8A' } };
        const headerFont = { name: 'Arial', family: 2, size: 10, bold: true, color: { argb: 'FFFFFF' } };
        const boldFont = { name: 'Arial', family: 2, size: 10, bold: true };
        const headerFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '3B82F6' }
        };
        const lightFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8FAFC' }
        };
        const borderStyle = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
        // 1. Report Title
        worksheet.mergeCells('A1:C1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'UNIVERSIDAD RICARDO PALMA - REPORTE DE EVALUACIÓN';
        titleCell.font = titleFont;
        titleCell.alignment = { horizontal: 'center' };
        worksheet.getRow(1).height = 25;
        // 2. Metadata details
        worksheet.getCell('A3').value = 'Rúbrica:';
        worksheet.getCell('A3').font = boldFont;
        worksheet.getCell('B3').value = report.tituloRubrica;
        worksheet.getCell('B3').font = primaryFont;
        worksheet.getCell('A4').value = 'ID Rúbrica:';
        worksheet.getCell('A4').font = boldFont;
        worksheet.getCell('B4').value = report.rubricaId;
        worksheet.getCell('B4').font = primaryFont;
        worksheet.getCell('A5').value = 'Emitido el:';
        worksheet.getCell('A5').font = boldFont;
        worksheet.getCell('B5').value = new Date().toLocaleDateString();
        worksheet.getCell('B5').font = primaryFont;
        // 3. General Metrics
        worksheet.getCell('A7').value = 'Métrica General';
        worksheet.getCell('A7').font = headerFont;
        worksheet.getCell('A7').fill = headerFill;
        worksheet.getCell('A7').alignment = { horizontal: 'left' };
        worksheet.getCell('B7').value = 'Valor';
        worksheet.getCell('B7').font = headerFont;
        worksheet.getCell('B7').fill = headerFill;
        worksheet.getCell('B7').alignment = { horizontal: 'center' };
        worksheet.mergeCells('B7:C7');
        const metricData = [
            ['Total de Estudiantes Evaluados', report.totalEvaluaciones],
            ['Promedio General del Grupo', report.promedioGeneral],
            ['Nota Máxima Obtenida', report.notaMaxima],
            ['Nota Mínima Obtenida', report.notaMinima]
        ];
        metricData.forEach((m, idx) => {
            const rowNum = 8 + idx;
            worksheet.getCell(`A${rowNum}`).value = m[0];
            worksheet.getCell(`A${rowNum}`).font = primaryFont;
            worksheet.getCell(`A${rowNum}`).border = borderStyle;
            worksheet.getCell(`B${rowNum}`).value = m[1];
            worksheet.getCell(`B${rowNum}`).font = boldFont;
            worksheet.getCell(`B${rowNum}`).alignment = { horizontal: 'center' };
            worksheet.getCell(`B${rowNum}`).border = borderStyle;
            worksheet.mergeCells(`B${rowNum}:C${rowNum}`);
            if (idx % 2 === 1) {
                worksheet.getCell(`A${rowNum}`).fill = lightFill;
                worksheet.getCell(`B${rowNum}`).fill = lightFill;
            }
        });
        // 4. Criteria Breakdown Title
        const breakdownStartRow = 14;
        worksheet.getCell(`A${breakdownStartRow}`).value = 'DESGLOSE DE CRITERIOS';
        worksheet.getCell(`A${breakdownStartRow}`).font = boldFont;
        // Table Header
        const tblHeadRow = breakdownStartRow + 1;
        worksheet.getCell(`A${tblHeadRow}`).value = 'Criterio / Descripción';
        worksheet.getCell(`B${tblHeadRow}`).value = 'Ponderación';
        worksheet.getCell(`C${tblHeadRow}`).value = 'Promedio (pts)';
        ['A', 'B', 'C'].forEach(col => {
            const cell = worksheet.getCell(`${col}${tblHeadRow}`);
            cell.font = headerFont;
            cell.fill = headerFill;
            cell.border = borderStyle;
            cell.alignment = { horizontal: col === 'A' ? 'left' : 'center' };
        });
        // Data rows for criteria
        report.criteriosStats.forEach((c, idx) => {
            const rowNum = tblHeadRow + 1 + idx;
            const cellA = worksheet.getCell(`A${rowNum}`);
            cellA.value = c.descripcion;
            cellA.font = primaryFont;
            cellA.border = borderStyle;
            cellA.alignment = { wrapText: true };
            const cellB = worksheet.getCell(`B${rowNum}`);
            cellB.value = `${c.ponderacion}%`;
            cellB.font = primaryFont;
            cellB.alignment = { horizontal: 'center' };
            cellB.border = borderStyle;
            const cellC = worksheet.getCell(`C${rowNum}`);
            cellC.value = c.promedioPuntos;
            cellC.font = boldFont;
            cellC.alignment = { horizontal: 'center' };
            cellC.border = borderStyle;
            if (idx % 2 === 1) {
                cellA.fill = lightFill;
                cellB.fill = lightFill;
                cellC.fill = lightFill;
            }
        });
        // Auto-adjust column widths
        worksheet.getColumn(1).width = 45;
        worksheet.getColumn(2).width = 18;
        worksheet.getColumn(3).width = 18;
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}
exports.ExcelGenerator = ExcelGenerator;
