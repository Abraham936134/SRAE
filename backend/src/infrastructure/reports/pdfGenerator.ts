import { ReporteGrupalOutput } from '../../application/reportes/GenerarReporteGrupal';

export class PdfGenerator {
  generate(report: ReporteGrupalOutput): Buffer {
    // Generate a structured textual report that simulates a document.
    // In production, you would use a package like pdfkit, but to avoid extra unrequested dependencies
    // we construct a formatted plain-text layout.
    const lines: string[] = [];
    lines.push('====================================================');
    lines.push(`REPORTE GRUPAL DE EVALUACIÓN: ${report.tituloRubrica.toUpperCase()}`);
    lines.push('====================================================');
    lines.push(`ID de Rúbrica: ${report.rubricaId}`);
    lines.push(`Fecha de Emisión: ${new Date().toLocaleDateString()}`);
    lines.push('');
    lines.push('----------------------------------------------------');
    lines.push('RESUMEN DE MÉTRICAS GENERALES');
    lines.push('----------------------------------------------------');
    lines.push(`Total de Estudiantes Evaluados: ${report.totalEvaluaciones}`);
    lines.push(`Promedio General del Grupo:    ${report.promedioGeneral.toFixed(2)}`);
    lines.push(`Nota Máxima Obtenida:          ${report.notaMaxima.toFixed(2)}`);
    lines.push(`Nota Mínima Obtenida:          ${report.notaMinima.toFixed(2)}`);
    lines.push('');
    lines.push('----------------------------------------------------');
    lines.push('DESGLOSE ESTADÍSTICO POR CRITERIO');
    lines.push('----------------------------------------------------');
    
    report.criteriosStats.forEach((c, idx) => {
      lines.push(`${idx + 1}. Criterio: ${c.descripcion}`);
      lines.push(`   Ponderación: ${c.ponderacion}%`);
      lines.push(`   Calificación Promedio del Grupo: ${c.promedioPuntos.toFixed(2)} pts`);
      lines.push('');
    });

    lines.push('====================================================');
    lines.push('FIN DEL REPORTE');
    lines.push('====================================================');

    return Buffer.from(lines.join('\n'), 'utf-8');
  }
}
