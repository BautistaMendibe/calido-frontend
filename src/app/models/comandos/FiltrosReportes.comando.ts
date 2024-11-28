export class FiltrosReportesComando {
  fechaDesde: Date;
  fechaHasta: Date;


  constructor(
    fechaDesde?: Date,
    fechaHasta?: Date
  ) {
    this.fechaDesde = fechaDesde!;
    this.fechaHasta = fechaHasta!;
  }
}
