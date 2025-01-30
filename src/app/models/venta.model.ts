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
  productosSeleccionadoParaAnular: Producto[];
  facturacion: TipoFactura;
  comprobanteAfip: ComprobanteAfip;
  idEmpleado: number;
  tarjeta: string;
  cantidadCuotas: number;
  interes: number;
  anulada: boolean;
  idCaja: number;
  fechaFacturacion: Date;
  fechaAnulacion: Date;
  totalAnulado: number;
  clienteDebe: number;
  ultimosCuatroDigitosTarjeta: string;

  totalDeVentas: number; // se usa para mostrar el total de ventas en paginación

  constructor(
      id?: number,
      montoTotal?: number,
      fecha?: Date,
      cliente?: Usuario,
      formaDePago?: FormaDePago,
      detalleVenta?: DetalleVenta[],
      productos?: Producto[],
      productosSeleccionadoParaAnular?: Producto[],
      facturacion?: TipoFactura,
      comprobanteAfip?: ComprobanteAfip,
      idEmpleado?: number,
      tarjeta?: string,
      cantidadCuotas?: number,
      interes?: number,
      anulada?: boolean,
      idCaja?: number,
      fechaFacturacion?: Date,
      fechaAnulacion?: Date,
      clienteDebe?: number,
      totalDeVentas?: number,
      totalAnulado?: number,
      ultimosCuatroDigitosTarjeta?: string
  ) {

    this.id = id!;
    this.montoTotal = montoTotal!;
    this.fecha = fecha!;
    this.cliente = cliente!;
    this.formaDePago = formaDePago!;
    this.detalleVenta = detalleVenta!;
    this.productos = productos!;
    this.productosSeleccionadoParaAnular = productosSeleccionadoParaAnular!;
    this.facturacion = facturacion!;
    this.comprobanteAfip = comprobanteAfip!;
    this.idEmpleado = idEmpleado!;
    this.tarjeta = tarjeta!;
    this.cantidadCuotas = cantidadCuotas!;
    this.interes = interes!;
    this.anulada = anulada!;
    this.idCaja = idCaja!;
    this.fechaFacturacion = fechaFacturacion!;
    this.fechaAnulacion = fechaAnulacion!;
    this.totalAnulado = totalAnulado!;
    this.clienteDebe = clienteDebe!;
    this.totalDeVentas = totalDeVentas!;
    this.ultimosCuatroDigitosTarjeta = ultimosCuatroDigitosTarjeta!;
  }
}
