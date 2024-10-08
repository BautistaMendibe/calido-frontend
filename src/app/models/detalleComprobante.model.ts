export class DetalleComprobante {
  id: number;
  cantidad: number;
  costoIndividual: number;
  subTotal: number;
  idcomprobante: number;
  idproducto: number;

  constructor(id?: number, cantidad?: number, costoIndividual?: number, subTotal?: number, idcomprobante?: number, producto?: number) {
    this.id = id!;
    this.cantidad = cantidad!;
    this.costoIndividual = costoIndividual!;
    this.subTotal = subTotal!;
    this.idcomprobante = idcomprobante!;
    this.idproducto = producto!;
  }
}
