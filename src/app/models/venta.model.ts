import { Usuario } from './usuario.model';
import { FormaDePago } from "./formaDePago.model";
import {DetalleVenta} from "./detalleVenta.model";

export class Venta {
  id: number;
  montoTotal: number;
  fecha: Date;
  usuario: Usuario;
  formaDePago: FormaDePago;
  detalleVenta: DetalleVenta[];

  constructor(id?: number, montoTotal?: number, fecha?: Date, usuario?: Usuario, formaDePago?: FormaDePago, detalleVenta?: DetalleVenta[]) {
    this.id = id!;
    this.montoTotal = montoTotal!;
    this.fecha = fecha!;
    this.usuario = usuario!;
    this.formaDePago = formaDePago!;
    this.detalleVenta = detalleVenta!;
  }
}
