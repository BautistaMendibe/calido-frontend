import {ReporteComando} from "./Reporte.comando";

export class SeccionReporteComando {
  nombre: string;
  icono: string;
  reportes: ReporteComando[];

  constructor(
    nombre: string,
    icono: string,
    reportes: ReporteComando[]
  ) {
    this.nombre = nombre!;
    this.icono = icono!;
    this.reportes = reportes!;
  }
}
