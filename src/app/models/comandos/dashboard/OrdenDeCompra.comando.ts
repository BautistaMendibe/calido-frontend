export class OrdenDeCompraComando {
  id: number;
  fechaPedido: Date;
  fechaEntrega: Date;
  total: number;
  proveedor: string;
  estadoPedido: string;

  constructor(
    id: number,
    fechaPedido: Date,
    fechaEntrega: Date,
    total: number,
    proveedor: string,
    estadoPedido: string
  ) {
    this.id = id!;
    this.fechaPedido = fechaPedido!;
    this.fechaEntrega = fechaEntrega!;
    this.total = total!;
    this.proveedor = proveedor!;
    this.estadoPedido = estadoPedido!;
  }
}
