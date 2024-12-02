import {FiltrosReportesComando} from "../FiltrosReportes.comando";
import {DataReporteComando} from "./DataReporte.comando";

export class ReporteComando {
  nombre: string;
  funcionSP: string;
  filtros: FiltrosReportesComando;
  activo: boolean = false;
  data: any[];
  columnas: string[];
  tipoGrafico: string;
  imagenGrafico: string;


  constructor(
    nombre: string,
    funcionSP: string,
    filtros?: FiltrosReportesComando,
    columnas?: string[],
    data?: any[],
    tipoGrafico?: string,
    imagenGrafico?: string
  ) {
    this.nombre = nombre!;
    this.funcionSP = funcionSP!;
    this.filtros = filtros!;
    this.data = data!;
    this.columnas = columnas!;
    this.tipoGrafico = tipoGrafico!;
    this.imagenGrafico = imagenGrafico!;
  }
}
