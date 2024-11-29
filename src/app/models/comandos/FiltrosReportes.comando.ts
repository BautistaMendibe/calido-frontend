export class FiltrosReportesComando {
  fechaDesde: Date;
  fechaHasta: Date;
  filtroNumerico: number;
  filtroString: string;

  constructor(
    fechaDesde?: Date,
    fechaHasta?: Date,
    filtroNumerico?: number,
    filtroString?:string
  ) {
    this.fechaDesde = fechaDesde!;
    this.fechaHasta = fechaHasta!;
    this.filtroNumerico = filtroNumerico!;
    this.filtroString = filtroString!;
  }
}
