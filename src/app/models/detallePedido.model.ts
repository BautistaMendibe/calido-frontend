export class DetallePedido {
  id: number;
  cantidad: number;
  subTotal: number;
  idpedido: number;
  idproducto: number;
  idestadodetallepedido: number;

  constructor(id?: number, cantidad?: number, subTotal?: number, pedido?: number, producto?: number, idestadodetallepedido?: number) {
    this.id = id!;
    this.cantidad = cantidad!;
    this.subTotal = subTotal!;
    this.idpedido = pedido!;
    this.idproducto = producto!;
    this.idestadodetallepedido = idestadodetallepedido!;
  }
}
