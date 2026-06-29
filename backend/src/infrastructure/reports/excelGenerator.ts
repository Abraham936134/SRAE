import { Workbook } from 'exceljs';
import { ReporteGrupalOutput } from '../../application/reportes/GenerarReporteGrupal';

export class ExcelGenerator {
  async generate(report: ReporteGrupalOutput): Promise<Buffer> {
    const workbook = new Workbook();
    
    // Style settings
    const primaryFont = { name: 'Arial', family: 2, size: 10 };
    const titleFont = { name: 'Arial', family: 2, size: 14, bold: true, color: { argb: '1E3A8A' } };
    const headerFont = { name: 'Arial', family: 2, size: 10, bold: true, color: { argb: 'FFFFFF' } };
    const boldFont = { name: 'Arial', family: 2, size: 10, bold: true };

    const headerFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: '3B82F6' }
    };

    const lightFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'F8FAFC' }
    };

    const borderStyle = {
      top: { style: 'thin' as const, color: { argb: 'E2E8F0' } },
      left: { style: 'thin' as const, color: { argb: 'E2E8F0' } },
      bottom: { style: 'thin' as const, color: { argb: 'E2E8F0' } },
      right: { style: 'thin' as const, color: { argb: 'E2E8F0' } }
    };

    // ----------------------------------------------------
    // TAB 1: RESUMEN ESTADÍSTICO
    // ----------------------------------------------------
    const worksheet = workbook.addWorksheet('Reporte Académico');

    // Report Title
    worksheet.mergeCells('A1:C1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'UNIVERSIDAD RICARDO PALMA - REPORTE DE EVALUACIÓN';
    titleCell.font = titleFont;
    titleCell.alignment = { horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Metadata details
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

    // General Metrics Headers
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

    // Criteria Breakdown Title
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

    // Auto-adjust column widths for Sheet 1
    worksheet.getColumn(1).width = 45;
    worksheet.getColumn(2).width = 18;
    worksheet.getColumn(3).width = 18;


    // ----------------------------------------------------
    // TAB 2: MATRIZ DE NOTAS (INDIVIDUAL REPORT PER STUDENT)
    // ----------------------------------------------------
    if (report.evaluacionesDetalle && report.evaluacionesDetalle.length > 0) {
      const sheet2 = workbook.addWorksheet('Matriz de Notas');
      
      // Title
      sheet2.mergeCells('A1:E1');
      const titleCell2 = sheet2.getCell('A1');
      titleCell2.value = `Matriz de Notas Consolidadas - Rúbrica: ${report.tituloRubrica}`;
      titleCell2.font = titleFont;
      titleCell2.alignment = { horizontal: 'center' };
      sheet2.getRow(1).height = 25;

      sheet2.addRow([]); // Blank row

      // Build Dynamic Headers
      const headers = ['Estudiante', 'Fecha de Evaluación'];
      report.criteriosStats.forEach((c, idx) => {
        headers.push(`Criterio ${idx + 1} (${c.ponderacion}%)`);
      });
      headers.push('Nota Final');

      const headerRow2 = sheet2.addRow(headers);
      headerRow2.height = 22;
      
      // Style headers
      headers.forEach((_, idx) => {
        const colLetter = String.fromCharCode(65 + idx); // A, B, C, D, ...
        const cell = sheet2.getCell(`${colLetter}3`);
        cell.font = headerFont;
        cell.fill = headerFill;
        cell.alignment = { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' };
        cell.border = borderStyle;
      });

      // Data Rows
      report.evaluacionesDetalle.forEach((ev, idx) => {
        const rowData: any[] = [
          ev.estudiante,
          new Date(ev.fecha).toLocaleDateString()
        ];

        // Add scores for each criterion
        report.criteriosStats.forEach((c) => {
          const resp = ev.respuestas.find((r) => r.criterioId === c.criterioId);
          rowData.push(resp ? resp.puntosNivel : 0);
        });

        // Add final score
        rowData.push(ev.notaFinal);

        const row = sheet2.addRow(rowData);
        row.height = 20;

        // Style data cells
        rowData.forEach((_, cellIdx) => {
          const colLetter = String.fromCharCode(65 + cellIdx);
          const cell = sheet2.getCell(`${colLetter}${4 + idx}`);
          cell.font = cellIdx === rowData.length - 1 ? boldFont : primaryFont;
          cell.border = borderStyle;
          cell.alignment = { horizontal: cellIdx === 0 ? 'left' : 'center', vertical: 'middle' };
          
          if (idx % 2 === 1) {
            cell.fill = lightFill;
          }
        });
      });

      // Adjust column widths for Sheet 2
      sheet2.getColumn(1).width = 30; // Estudiante
      sheet2.getColumn(2).width = 18; // Fecha
      report.criteriosStats.forEach((_, idx) => {
        sheet2.getColumn(3 + idx).width = 16; // Criterio columns
      });
      sheet2.getColumn(3 + report.criteriosStats.length).width = 15; // Nota Final
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}
