import { Usuario } from './usuario.model';
import { FormaDePago } from "./formaDePago.model";
import {DetalleVenta} from "./detalleVenta.model";
import {Producto} from "./producto.model";
import {TipoFactura} from "./tipoFactura.model";
import {ComprobanteAfip} from "./ComprobanteAfip.model";

export class Venta {
  id: number | undefined;
  montoTotal: number;
  fecha: Date;
  cliente: Usuario;
  formaDePago: FormaDePago;
  detalleVenta: DetalleVenta[];
  productos: Producto[];
  facturacion: TipoFactura;
  comprobanteAfip: ComprobanteAfip;
  idEmpleado: number;
  tarjeta: string;
  cantidadCuotas: number;
  interes: number;
  descuento: number;

  constructor(
      id?: number,
      montoTotal?: number,
      fecha?: Date,
      cliente?: Usuario,
      formaDePago?: FormaDePago,
      detalleVenta?: DetalleVenta[],
      productos?: Producto[],
      facturacion?: TipoFactura,
      comprobanteAfip?: ComprobanteAfip,
      idEmpleado?: number,
      tarjeta?: string,
      cantidadCuotas?: number,
      interes?: number,
      descuento?: number
  ) {

    this.id = id!;
    this.montoTotal = montoTotal!;
    this.fecha = fecha!;
    this.cliente = cliente!;
    this.formaDePago = formaDePago!;
    this.detalleVenta = detalleVenta!;
    this.productos = productos!;
    this.facturacion = facturacion!;
    this.comprobanteAfip = comprobanteAfip!;
    this.idEmpleado = idEmpleado!;
    this.tarjeta = tarjeta!;
    this.cantidadCuotas = cantidadCuotas!;
    this.interes = interes!;
    this.descuento = descuento!;
  }
}
