"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFGenerator = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PDFGenerator {
    static async generarReporteMensual(datos, res) {
        const doc = new pdfkit_1.default({ margin: 50, size: 'LETTER' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${datos.funcionario.apellido}_${datos.periodo.mes}_${datos.periodo.anio}.pdf`);
        doc.pipe(res);
        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('REPORTE MENSUAL DE ASISTENCIAS', { align: 'center' })
            .moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('Datos del Funcionario:', { underline: true }).moveDown(0.5);
        doc
            .font('Helvetica')
            .fontSize(10)
            .text(`Nombre: ${datos.funcionario.nombre} ${datos.funcionario.apellido}`)
            .text(`Cargo: ${datos.funcionario.cargo}`)
            .text(`Dependencia: ${datos.funcionario.dependencia}`)
            .moveDown();
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Periodo:', { underline: true })
            .moveDown(0.5);
        doc
            .font('Helvetica')
            .fontSize(10)
            .text(`Mes: ${datos.periodo.mes}`)
            .text(`Año: ${datos.periodo.anio}`)
            .moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('Resumen:', { underline: true }).moveDown(0.5);
        const horasTrabajadas = Math.floor(datos.resumen.totalMinutosTrabajados / 60);
        const minutosTrabajados = datos.resumen.totalMinutosTrabajados % 60;
        const horasTardanza = Math.floor(datos.resumen.totalMinutosTardanza / 60);
        const minutosTardanza = datos.resumen.totalMinutosTardanza % 60;
        doc
            .font('Helvetica')
            .fontSize(10)
            .text(`Días trabajados: ${datos.resumen.totalDiasTrabajados}`)
            .text(`Tiempo trabajado: ${horasTrabajadas}h ${minutosTrabajados}m`)
            .text(`Tardanzas: ${horasTardanza}h ${minutosTardanza}m`)
            .text(`Ausencias: ${datos.resumen.totalAusencias}`)
            .text(`Permisos: ${datos.resumen.totalPermisos}`)
            .moveDown(2);
        if (datos.marcajes.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('Detalle de Marcajes:', { underline: true }).moveDown(0.5);
            const tableTop = doc.y;
            const col1 = 50;
            const col2 = 150;
            const col3 = 280;
            const col4 = 410;
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .text('Fecha', col1, tableTop)
                .text('Tipo Marcaje', col2, tableTop)
                .text('Hora', col3, tableTop)
                .text('Tardanza (min)', col4, tableTop);
            doc
                .moveTo(col1, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();
            let y = tableTop + 20;
            doc.font('Helvetica').fontSize(8);
            datos.marcajes.forEach((marcaje, index) => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                if (index % 2 === 0) {
                    doc.rect(col1 - 5, y - 3, 505, 12).fill('#f0f0f0');
                    doc.fillColor('#000000');
                }
                doc
                    .text(marcaje.fecha, col1, y)
                    .text(this.formatTipoMarcaje(marcaje.tipoMarcaje), col2, y)
                    .text(marcaje.horaMarcaje, col3, y)
                    .text(marcaje.minutosTardanza.toString(), col4, y);
                y += 15;
            });
        }
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc
                .fontSize(8)
                .font('Helvetica')
                .text(`Página ${i + 1} de ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
            doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 50, doc.page.height - 35, { align: 'center' });
        }
        doc.end();
    }
    static formatTipoMarcaje(tipo) {
        const formatos = {
            INGRESO_MANANA: 'Ingreso Mañana',
            SALIDA_DESCANSO: 'Salida Descanso',
            INGRESO_TARDE: 'Ingreso Tarde',
            SALIDA_FINAL: 'Salida Final',
        };
        return formatos[tipo] || tipo;
    }
    static obtenerNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        return meses[mes - 1] || 'Desconocido';
    }
}
exports.PDFGenerator = PDFGenerator;
//# sourceMappingURL=pdf-generator.js.map