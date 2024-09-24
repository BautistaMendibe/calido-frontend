export class DetallePedido {
  id: number;
  cantidad: number;
  subTotal: number;
  idpedido: number;
  idproducto: number;

  constructor(id?: number, cantidad?: number, subTotal?: number, pedido?: number, producto?: number) {
    this.id = id!;
    this.cantidad = cantidad!;
    this.subTotal = subTotal!;
    this.idpedido = pedido!;
    this.idproducto = producto!;
  }
}
