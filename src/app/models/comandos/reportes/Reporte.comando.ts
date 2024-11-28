import {FiltrosReportesComando} from "../FiltrosReportes.comando";

export class ReporteComando {
  nombre: string;
  funcionSP: string;
  filtros: FiltrosReportesComando;
  activo: boolean = false;


  constructor(
    nombre: string,
    funcionSP: string,
    filtros: FiltrosReportesComando
  ) {
    this.nombre = nombre!;
    this.funcionSP = funcionSP!;
    this.filtros = filtros!;
  }
}
