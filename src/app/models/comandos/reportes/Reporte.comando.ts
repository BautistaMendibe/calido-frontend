import {FiltrosReportesComando} from "../FiltrosReportes.comando";
import {DataReporteComando} from "./DataReporte.comando";

export class ReporteComando {
  nombre: string;
  funcionSP: string;
  filtros: FiltrosReportesComando;
  activo: boolean = false;
  data: any[];
  columnas: string[];
  imagenGrafico?: string;
  noNecesitaFiltro: boolean;
  noNecesitaGrafico: boolean;


  constructor(
    nombre: string,
    funcionSP: string,
    filtros?: FiltrosReportesComando,
    columnas?: string[],
    data?: any[],
    imagenGrafico?: string,
    noNecesitaFiltro?: boolean,
    noNecesitaGrafico?: boolean,
  ) {
    this.nombre = nombre!;
    this.funcionSP = funcionSP!;
    this.filtros = filtros!;
    this.data = data!;
    this.columnas = columnas!;
    this.imagenGrafico = imagenGrafico!;
    this.noNecesitaFiltro = noNecesitaFiltro!;
    this.noNecesitaGrafico = noNecesitaGrafico!;
  }
}
