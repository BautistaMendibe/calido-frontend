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
    total?: number
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
  }
}
