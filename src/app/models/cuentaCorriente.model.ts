import {Usuario} from "./usuario.model";

export class CuentaCorriente {
  id: number;
  fechaDesde: Date;
  fechaHasta: Date;
  balanceTotal: number;
  usuario: Usuario;

  constructor(
    id?: number,
    fechaDesde?: Date,
    fechaHasta?: Date,
    balanceTotal?: number,
    usuario?: Usuario
  ) {
    this.id = id!;
    this.fechaDesde = fechaDesde!;
    this.fechaHasta = fechaHasta!;
    this.balanceTotal = balanceTotal!;
    this.usuario = usuario!;
  }
}
