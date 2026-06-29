import PDFDocument from 'pdfkit';
import { ReporteGrupalOutput } from '../../application/reportes/GenerarReporteGrupal';

export class PdfGenerator {
  generate(report: ReporteGrupalOutput): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];
      
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Title & Header
      doc.fillColor('#1E3A8A').fontSize(20).text('UNIVERSIDAD RICARDO PALMA', { align: 'center' });
      doc.fontSize(10).fillColor('#475569').text('SISTEMA DE RÚBRICAS ANALÍTICAS PARA EVALUACIÓN ACADÉMICA (SRAE)', { align: 'center' });
      doc.moveDown(1.5);

      // Report Title
      doc.fillColor('#0F172A').fontSize(14).text('REPORTE CONSOLIDADO GRUPAL', { align: 'left' });
      doc.fontSize(16).fillColor('#2563EB').text(report.tituloRubrica.toUpperCase(), { align: 'left' });
      doc.moveDown(0.2);
      
      // Divider
      doc.strokeColor('#2563EB').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Metadata section
      doc.fillColor('#475569').fontSize(10);
      doc.text(`ID Rúbrica: ${report.rubricaId}`);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`);
      doc.moveDown(1.5);

      // Metrics block
      doc.fillColor('#1E3A8A').fontSize(12).text('RESUMEN DE MÉTRICAS GENERALES', { underline: false });
      doc.moveDown(0.5);

      // Draw a background box for the metrics
      const boxTop = doc.y;
      doc.rect(50, boxTop - 5, 495, 75).fillColor('#F8FAFC').fill().strokeColor('#E2E8F0').lineWidth(1).rect(50, boxTop - 5, 495, 75).stroke();
      
      // Put text in the box
      doc.fillColor('#334155').fontSize(10);
      doc.text(`Total de Estudiantes Evaluados:  ${report.totalEvaluaciones}`, 70, boxTop + 5);
      doc.text(`Promedio General del Grupo:     ${report.promedioGeneral.toFixed(2)} / 20.00`, 70, boxTop + 20);
      doc.text(`Nota Máxima Obtenida:           ${report.notaMaxima.toFixed(2)}`, 70, boxTop + 35);
      doc.text(`Nota Mínima Obtenida:           ${report.notaMinima.toFixed(2)}`, 70, boxTop + 50);

      // Restore y coordinate after the box
      doc.y = boxTop + 85;

      // Criteria stats header
      doc.fillColor('#1E3A8A').fontSize(12).text('DESGLOSE ESTADÍSTICO POR CRITERIO');
      doc.moveDown(0.5);

      // Draw table header
      const tableTop = doc.y;
      doc.rect(50, tableTop, 495, 20).fillColor('#3B82F6').fill();
      doc.fillColor('#FFFFFF').fontSize(9);
      doc.text('Criterio / Descripción', 60, tableTop + 5, { width: 280 });
      doc.text('Ponderación', 360, tableTop + 5, { width: 80, align: 'center' });
      doc.text('Promedio (pts)', 450, tableTop + 5, { width: 80, align: 'center' });

      let currentY = tableTop + 20;

      // Draw rows
      report.criteriosStats.forEach((c, idx) => {
        // Draw background for zebra striping
        if (idx % 2 === 1) {
          doc.rect(50, currentY, 495, 30).fillColor('#F1F5F9').fill();
        }
        
        doc.fillColor('#1E293B').fontSize(9);
        const desc = c.descripcion.length > 55 ? `${c.descripcion.substring(0, 52)}...` : c.descripcion;
        doc.text(desc, 60, currentY + 10, { width: 280 });
        doc.text(`${c.ponderacion}%`, 360, currentY + 10, { width: 80, align: 'center' });
        doc.text(c.promedioPuntos.toFixed(2), 450, currentY + 10, { width: 80, align: 'center' });

        // Bottom border line
        doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, currentY + 30).lineTo(545, currentY + 30).stroke();
        currentY += 30;
      });

      doc.y = currentY + 20;

      // 6. Individual student evaluations section (appended page)
      if (report.evaluacionesDetalle && report.evaluacionesDetalle.length > 0) {
        doc.addPage();
        
        doc.fillColor('#1E3A8A').fontSize(14).text('DETALLE DE EVALUACIONES INDIVIDUALES', { align: 'center' });
        doc.fontSize(10).fillColor('#475569').text('RELACIÓN DE NOTAS POR ESTUDIANTE', { align: 'center' });
        doc.moveDown(1);
        doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1.5);

        // Header for students list
        const listHeaderTop = doc.y;
        doc.rect(50, listHeaderTop, 495, 20).fillColor('#475569').fill();
        doc.fillColor('#FFFFFF').fontSize(9);
        doc.text('Estudiante / Alumno', 60, listHeaderTop + 5, { width: 220 });
        doc.text('Fecha Evaluación', 300, listHeaderTop + 5, { width: 100, align: 'center' });
        doc.text('Nota Final', 420, listHeaderTop + 5, { width: 110, align: 'center' });

        let currentStudentY = listHeaderTop + 20;

        report.evaluacionesDetalle.forEach((ev, idx) => {
          // If we reach near the page margin, add a new page
          if (currentStudentY > doc.page.height - 80) {
            doc.addPage();
            currentStudentY = 50;
          }

          if (idx % 2 === 1) {
            doc.rect(50, currentStudentY, 495, 25).fillColor('#F8FAFC').fill();
          }

          doc.fillColor('#1E293B').fontSize(9);
          doc.text(ev.estudiante, 60, currentStudentY + 7, { width: 220 });
          doc.text(new Date(ev.fecha).toLocaleDateString(), 300, currentStudentY + 7, { width: 100, align: 'center' });
          
          // Draw bold highlight for grades
          doc.fillColor('#0F172A').font('Helvetica-Bold');
          doc.text(ev.notaFinal.toFixed(2), 420, currentStudentY + 7, { width: 110, align: 'center' });
          doc.font('Helvetica'); // restore font

          doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, currentStudentY + 25).lineTo(545, currentStudentY + 25).stroke();
          currentStudentY += 25;
        });

        doc.y = currentStudentY + 20;
      }

      // Footer divider
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
      doc.fillColor('#94A3B8').fontSize(9).text('Este es un reporte institucional emitido por la Universidad Ricardo Palma.', { align: 'center' });
      doc.text('Fin del documento.', { align: 'center' });

      doc.end();
    });
  }
}
