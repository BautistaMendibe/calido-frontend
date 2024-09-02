
export class CuentaCorriente {
  id: number;
  fechaDesde: Date;
  fechaHasta: Date;
  diasDeuda: number;
  balanceTotal: number;

  constructor(
    id?: number,
    fechaDesde?: Date,
    fechaHasta?: Date,
    diasDeuda?: number,
    balanceTotal?: number
  ) {
    this.id = id!;
    this.fechaDesde = fechaDesde!;
    this.fechaHasta = fechaHasta!;
    this.diasDeuda = diasDeuda!;
    this.balanceTotal = balanceTotal!;
  }
}
