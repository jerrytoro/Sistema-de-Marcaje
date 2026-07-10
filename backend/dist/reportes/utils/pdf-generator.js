"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFGenerator = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PDFGenerator {
    static async generarReporteMensual(datosReporte, res) {
        const doc = new pdfkit_1.default({
            margin: 40,
            size: 'A4',
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${datosReporte.funcionario.apellido}_${datosReporte.periodo.mes}_${datosReporte.periodo.anio}.pdf`);
        doc.pipe(res);
        this.generarContenido(doc, datosReporte);
        doc.end();
    }
    static async generarPDFDesdeReporte(funcionario, periodo, resumen, diasTrabajados, res) {
        const asistenciasPorDia = diasTrabajados.map((dia) => {
            let cantidadMarcajes = 0;
            if (dia.ingresoManana)
                cantidadMarcajes++;
            if (dia.salidaDescanso)
                cantidadMarcajes++;
            if (dia.ingresoTarde)
                cantidadMarcajes++;
            if (dia.salidaFinal)
                cantidadMarcajes++;
            return {
                fecha: dia.fecha,
                ingresoManana: dia.ingresoManana?.hora || null,
                salidaDescanso: dia.salidaDescanso?.hora || null,
                ingresoTarde: dia.ingresoTarde?.hora || null,
                salidaFinal: dia.salidaFinal?.hora || null,
                tardanza: dia.totalTardanza > 0 ? this.formatearTiempo(dia.totalTardanza) : '-',
                salidaAnticipada: dia.totalSalidaAnticipada > 0
                    ? this.formatearTiempo(dia.totalSalidaAnticipada)
                    : '-',
                permisos: dia.permisos || '-',
                jornada: this.formatearTiempo(dia.jornada),
                cantidadMarcajes,
            };
        });
        const datosReporte = {
            funcionario,
            periodo,
            resumen: {
                diasTrabajados: resumen.totalDiasTrabajados,
                tiempoTrabajado: this.formatearTiempo(resumen.totalMinutosTrabajados),
                tardanzaTotal: this.formatearTiempo(resumen.totalMinutosTardanza),
                salidaAnticipadaTotal: this.formatearTiempo(resumen.totalSalidaAnticipada),
            },
            asistenciasPorDia,
        };
        await this.generarReporteMensual(datosReporte, res);
    }
    static procesarMarcajesConLogicaCorrecta(marcajes, horarios) {
        const diasMap = new Map();
        marcajes.forEach((marcaje) => {
            const fecha = marcaje.fecha.toISOString().split('T')[0];
            if (!diasMap.has(fecha)) {
                diasMap.set(fecha, []);
            }
            diasMap.get(fecha).push(marcaje);
        });
        let totalTardanza = 0;
        let totalSalidaAnticipada = 0;
        let totalJornada = 0;
        const diasTrabajados = [];
        diasMap.forEach((marcajesDia, fechaStr) => {
            marcajesDia.sort((a, b) => a.horaMarcaje.getTime() - b.horaMarcaje.getTime());
            const dia = {
                fecha: this.formatearFechaCorta(fechaStr),
                ingresoManana: null,
                salidaDescanso: null,
                ingresoTarde: null,
                salidaFinal: null,
                totalTardanza: 0,
                totalSalidaAnticipada: 0,
                jornada: 0,
                permisos: '-',
            };
            const permisosArray = [];
            marcajesDia.forEach((marcaje) => {
                const horaReal = marcaje.horaMarcaje.toTimeString().substring(0, 5);
                const tardanza = marcaje.minutosTardanza || 0;
                const anticipada = marcaje.minutosSalidaAnticipada || 0;
                if (marcaje.observacion && marcaje.observacion.trim() !== '') {
                    permisosArray.push(marcaje.observacion.trim());
                }
                switch (marcaje.tipoMarcaje) {
                    case 'INGRESO_MANANA':
                        const toleranciaManana = horarios.toleranciaIngresoManana || 0;
                        dia.ingresoManana = {
                            hora: horaReal + (toleranciaManana > 0 ? ` (+${toleranciaManana})` : ''),
                            tardanza: tardanza,
                            horaReal: horaReal,
                            tolerancia: toleranciaManana,
                        };
                        dia.totalTardanza += tardanza;
                        break;
                    case 'SALIDA_DESCANSO':
                        dia.salidaDescanso = {
                            hora: horaReal,
                            anticipada: anticipada,
                        };
                        dia.totalSalidaAnticipada += anticipada;
                        break;
                    case 'INGRESO_TARDE':
                        const toleranciaTarde = horarios.toleranciaIngresoTarde || 0;
                        dia.ingresoTarde = {
                            hora: horaReal + (toleranciaTarde > 0 ? ` (+${toleranciaTarde})` : ''),
                            tardanza: tardanza,
                            horaReal: horaReal,
                            tolerancia: toleranciaTarde,
                        };
                        dia.totalTardanza += tardanza;
                        break;
                    case 'SALIDA_FINAL':
                        dia.salidaFinal = {
                            hora: horaReal,
                            anticipada: anticipada,
                        };
                        dia.totalSalidaAnticipada += anticipada;
                        break;
                }
            });
            if (permisosArray.length > 0) {
                dia.permisos = permisosArray.join(', ');
            }
            const cantidadMarcajes = marcajesDia.length;
            if (cantidadMarcajes === 1) {
                dia.jornada = 0;
            }
            else if (cantidadMarcajes >= 2) {
                let jornadaManana = 0;
                let jornadaTarde = 0;
                if (dia.ingresoManana && dia.salidaDescanso) {
                    const horaIngresoReal = dia.ingresoManana.horaReal;
                    const tolerancia = dia.ingresoManana.tolerancia;
                    const ingresoRealMin = this.convertirHoraAMinutos(horaIngresoReal);
                    const salidaRealMin = this.convertirHoraAMinutos(dia.salidaDescanso.hora);
                    const ingresoConfigMin = this.convertirHoraAMinutos(horarios.ingresoManana);
                    const salidaConfigMin = this.convertirHoraAMinutos(horarios.salidaDescanso);
                    let ingresoParaCalculo;
                    if (tolerancia > 0) {
                        const ingresoConTolerancia = ingresoRealMin - tolerancia;
                        ingresoParaCalculo = Math.max(ingresoConfigMin, ingresoConTolerancia);
                    }
                    else {
                        ingresoParaCalculo = Math.max(ingresoConfigMin, ingresoRealMin);
                    }
                    const salidaParaCalculo = salidaRealMin > salidaConfigMin ? salidaConfigMin : salidaRealMin;
                    jornadaManana = Math.max(0, salidaParaCalculo - ingresoParaCalculo);
                }
                if (dia.ingresoTarde && dia.salidaFinal) {
                    const horaIngresoReal = dia.ingresoTarde.horaReal;
                    const tolerancia = dia.ingresoTarde.tolerancia;
                    const ingresoRealMin = this.convertirHoraAMinutos(horaIngresoReal);
                    const salidaRealMin = this.convertirHoraAMinutos(dia.salidaFinal.hora);
                    const ingresoConfigMin = this.convertirHoraAMinutos(horarios.ingresoTarde);
                    const salidaConfigMin = this.convertirHoraAMinutos(horarios.salidaFinal);
                    let ingresoParaCalculo;
                    if (tolerancia > 0) {
                        const ingresoConTolerancia = ingresoRealMin - tolerancia;
                        ingresoParaCalculo = Math.max(ingresoConfigMin, ingresoConTolerancia);
                    }
                    else {
                        ingresoParaCalculo = Math.max(ingresoConfigMin, ingresoRealMin);
                    }
                    const salidaParaCalculo = salidaRealMin > salidaConfigMin ? salidaConfigMin : salidaRealMin;
                    jornadaTarde = Math.max(0, salidaParaCalculo - ingresoParaCalculo);
                }
                dia.jornada = jornadaManana + jornadaTarde;
            }
            totalTardanza += dia.totalTardanza;
            totalSalidaAnticipada += dia.totalSalidaAnticipada;
            totalJornada += dia.jornada;
            diasTrabajados.push(dia);
        });
        return {
            diasTrabajados: diasTrabajados.sort((a, b) => a.fecha.localeCompare(b.fecha)),
            totalTardanza,
            totalSalidaAnticipada,
            totalJornada,
            diasUnicos: diasMap.size,
        };
    }
    static generarContenido(doc, datosReporte) {
        doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(`REPORTE MENSUAL DE ASISTENCIAS - ${datosReporte.periodo.mes.toUpperCase()} ${datosReporte.periodo.anio}`, {
            align: 'center',
        })
            .moveDown(1.5);
        const pageWidth = doc.page.width;
        const margin = 40;
        const col1X = margin;
        const col2X = pageWidth / 3;
        const col3X = (pageWidth / 3) * 2;
        const startY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Funcionario:', col1X, startY);
        doc.font('Helvetica');
        doc.text(`${datosReporte.funcionario.nombre} ${datosReporte.funcionario.apellido}`, col1X, startY + 15);
        doc.text(`Cargo: ${datosReporte.funcionario.cargo}`, col1X, startY + 28);
        doc.text(`Dep: ${datosReporte.funcionario.dependencia}`, col1X, startY + 41);
        doc.font('Helvetica-Bold');
        doc.text('Periodo:', col2X, startY);
        doc.font('Helvetica');
        doc.text(`Del ${datosReporte.periodo.fechaInicio} al ${datosReporte.periodo.fechaFin}`, col2X, startY + 15);
        doc.font('Helvetica-Bold');
        doc.text('Resumen:', col3X, startY);
        doc.font('Helvetica');
        doc.text(`Días trabajados: ${datosReporte.resumen.diasTrabajados}`, col3X, startY + 15);
        doc.text(`Tiempo trabajado: ${datosReporte.resumen.tiempoTrabajado}`, col3X, startY + 28);
        doc.text(`Tardanzas: ${datosReporte.resumen.tardanzaTotal}`, col3X, startY + 41);
        doc.text(`Salida Anticipada: ${datosReporte.resumen.salidaAnticipadaTotal}`, col3X, startY + 54);
        doc.y = startY + 75;
        doc.moveDown(1);
        this.dibujarTabla(doc, datosReporte, doc.y);
    }
    static dibujarTabla(doc, datosReporte, startY) {
        const colWidths = [35, 45, 50, 45, 50, 45, 50, 150, 45];
        const rowHeight = 15;
        const headerHeight = 24;
        const margin = 40;
        let yPos = startY;
        const headers = [
            'Fecha',
            'Ingreso\nMañana',
            'Salida\nDescanso',
            'Ingreso\nTarde',
            'Salida\nFinal',
            'Tardanza',
            'Salida\nAnticipada',
            'Permisos',
            'Jornada',
        ];
        doc.fontSize(8).font('Helvetica-Bold');
        headers.forEach((header, i) => {
            const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc
                .rect(x, yPos, colWidths[i], headerHeight)
                .fillAndStroke('#5a5a5a', '#fff');
            doc.fillColor('#fff').text(header, x + 2, yPos + 5, {
                width: colWidths[i] - 4,
                align: 'center',
            });
        });
        yPos += headerHeight;
        yPos += 3;
        doc.fontSize(9).font('Helvetica');
        datosReporte.asistenciasPorDia.forEach((dia) => {
            const rowData = [
                dia.fecha,
                dia.ingresoManana || '-',
                dia.salidaDescanso || '-',
                dia.ingresoTarde || '-',
                dia.salidaFinal || '-',
                dia.tardanza,
                dia.salidaAnticipada,
                dia.permisos,
                dia.jornada,
            ];
            let maxRowHeight = rowHeight;
            const permisosHeight = doc.heightOfString(dia.permisos, { width: colWidths[7] - 4, align: 'center' });
            if (permisosHeight + 6 > maxRowHeight) {
                maxRowHeight = permisosHeight + 6;
            }
            rowData.forEach((data, i) => {
                const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                let fillColor = '#fff';
                let textColor = '#000';
                if (i === 5 && data !== '-') {
                    fillColor = '#ffb6b6';
                }
                else if (i === 6 && data !== '-') {
                    fillColor = '#ffb6b6';
                }
                else if (i === 8 && data !== '-') {
                    if (dia.cantidadMarcajes === 1) {
                        fillColor = '#ff0000';
                        textColor = '#fff';
                    }
                    else if (dia.cantidadMarcajes === 2 || dia.cantidadMarcajes === 3) {
                        fillColor = '#ffff00';
                    }
                }
                doc.rect(x, yPos, colWidths[i], maxRowHeight).fillAndStroke(fillColor, '#000');
                const textHeight = doc.heightOfString(String(data), { width: colWidths[i] - 4, align: 'center' });
                const yOffset = (maxRowHeight - textHeight) / 2;
                doc.fillColor(textColor).text(String(data), x + 2, yPos + yOffset, {
                    width: colWidths[i] - 4,
                    align: 'center',
                });
            });
            yPos += maxRowHeight;
            if (yPos > doc.page.height - 100) {
                doc.addPage();
                yPos = 60;
                doc.fontSize(8).font('Helvetica-Bold');
                headers.forEach((header, i) => {
                    const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    doc
                        .rect(x, yPos, colWidths[i], headerHeight)
                        .fillAndStroke('#5a5a5a', '#fff');
                    doc.fillColor('#fff').text(header, x + 2, yPos + 5, {
                        width: colWidths[i] - 4,
                        align: 'center',
                    });
                });
                yPos += headerHeight;
                yPos += 3;
                doc.fontSize(7).font('Helvetica');
            }
        });
        yPos += 5;
        const totalesData = [
            'TOTAL',
            '-',
            '-',
            '-',
            '-',
            datosReporte.resumen.tardanzaTotal,
            datosReporte.resumen.salidaAnticipadaTotal,
            '-',
            datosReporte.resumen.tiempoTrabajado,
        ];
        doc.fontSize(9).font('Helvetica-Bold');
        totalesData.forEach((data, i) => {
            const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc
                .rect(x, yPos, colWidths[i], rowHeight + 3)
                .fillAndStroke('#ff4040', '#fff');
            doc.fillColor('#fff').text(String(data), x + 2, yPos + 6, {
                width: colWidths[i] - 4,
                align: 'center',
            });
        });
    }
    static convertirHoraAMinutos(hora) {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos;
    }
    static formatearFechaCorta(fecha) {
        const [anio, mes, dia] = fecha.split('-');
        return `${dia}/${mes}`;
    }
    static formatearTiempo(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas}h ${mins.toString().padStart(2, '0')}m`;
    }
    static obtenerNombreMes(mes) {
        const meses = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre',
        ];
        return meses[mes - 1] || 'Desconocido';
    }
}
exports.PDFGenerator = PDFGenerator;
//# sourceMappingURL=pdf-generator.js.map