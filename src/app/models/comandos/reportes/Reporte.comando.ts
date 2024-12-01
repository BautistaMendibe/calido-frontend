import {FiltrosReportesComando} from "../FiltrosReportes.comando";
import {DataReporteComando} from "./DataReporte.comando";

export class ReporteComando {
  nombre: string;
  funcionSP: string;
  filtros: FiltrosReportesComando;
  activo: boolean = false;
  data: any[];
  columnas: string[];


  constructor(
    nombre: string,
    funcionSP: string,
    filtros?: FiltrosReportesComando,
    columnas?: string[],
    data?: any[],
  ) {
    this.nombre = nombre!;
    this.funcionSP = funcionSP!;
    this.filtros = filtros!;
    this.data = data!;
    this.columnas = columnas!;
  }
}
