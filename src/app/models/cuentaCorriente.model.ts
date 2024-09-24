import {Usuario} from "./usuario.model";

export class CuentaCorriente {
  id: number;
  idUsuario: number;
  fechaDesde: Date;
  fechaHasta: Date;
  balanceTotal: number;
  usuario: Usuario;

  constructor(
    id?: number,
    idUsuario?: number,
    fechaDesde?: Date,
    fechaHasta?: Date,
    balanceTotal?: number,
    usuario?: Usuario
  ) {
    this.id = id!;
    this.idUsuario = idUsuario!;
    this.fechaDesde = fechaDesde!;
    this.fechaHasta = fechaHasta!;
    this.balanceTotal = balanceTotal!;
    this.usuario = usuario!;
  }
}
