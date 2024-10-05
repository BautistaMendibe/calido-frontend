import { Usuario } from './usuario.model';
import { FormaDePago } from "./formaDePago.model";
import {DetalleVenta} from "./detalleVenta.model";
import {Producto} from "./producto.model";
import {TipoFactura} from "./tipoFactura.model";

export class Venta {
  id: number | undefined;
  montoTotal: number;
  fecha: Date;
  usuario: Usuario;
  formaDePago: FormaDePago;
  detalleVenta: DetalleVenta[];
  productos: Producto[];
  facturacion: TipoFactura;

  constructor(id?: number, montoTotal?: number, fecha?: Date, usuario?: Usuario, formaDePago?: FormaDePago, detalleVenta?: DetalleVenta[], productos?: Producto[], facturacion?: TipoFactura) {
    this.id = id!;
    this.montoTotal = montoTotal!;
    this.fecha = fecha!;
    this.usuario = usuario!;
    this.formaDePago = formaDePago!;
    this.detalleVenta = detalleVenta!;
    this.productos = productos!;
    this.facturacion = facturacion!;
  }
}
