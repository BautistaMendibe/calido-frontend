import {DetallePedido} from "./detallePedido.model";
import {Proveedor} from "./proveedores.model";
import {Transporte} from "./transporte.model";
import {EstadoPedido} from "./estadoPedido";

export class Pedido {
  id: number;
  montoEnvio: number;
  fechaPedido: Date;
  fechaEntrega: Date;
  idEstadoPedido: number;
  idTransporte: number;
  idProveedor: number;
  descuento: number;
  impuesto: number;
  observaciones: string;
  total: number;

  detallePedido: DetallePedido[];
  proveedor: Proveedor;
  transporte: Transporte;
  estadoPedido: EstadoPedido;

  constructor(
    id?: number,
    montoEnvio?: number,
    fechaPedido?: Date,
    fechaEntrega?: Date,
    idEstadoPedido?: number,
    idTransporte?: number,
    idProveedor?: number,
    descuento?: number,
    impuesto?: number,
    observaciones?: string,
    total?: number,
    detallePedido?: DetallePedido[],
    proveedor?: Proveedor,
    transporte?: Transporte,
    estadoPedido?: EstadoPedido
  ) {
    this.id = id!;
    this.montoEnvio = montoEnvio!;
    this.fechaPedido = fechaPedido!;
    this.fechaEntrega = fechaEntrega!;
    this.idEstadoPedido = idEstadoPedido!;
    this.idTransporte = idTransporte!;
    this.idProveedor = idProveedor!;
    this.descuento = descuento!;
    this.impuesto = impuesto!;
    this.observaciones = observaciones!;
    this.total = total!;
    this.detallePedido = detallePedido!;
    this.proveedor = proveedor!;
    this.transporte = transporte!;
    this.estadoPedido = estadoPedido!;
  }
}
