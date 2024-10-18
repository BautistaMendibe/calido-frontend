import {Producto} from "./producto.model";

export class MovimientoProducto {
  id: number;
  idProducto: number;
  fecha: Date;
  tipoMovimiento: string;
  cantidad: number;
  referencia: string;

  producto: Producto;

  constructor(
    id?: number,
    idProducto?: number,
    fecha?: Date,
    tipo_movimiento?: string,
    cantidad?: number,
    referencia?: string,
    producto?: Producto
  ) {
    this.id = id!;
    this.idProducto = idProducto!;
    this.fecha = fecha!;
    this.tipoMovimiento = tipo_movimiento!;
    this.cantidad = cantidad!;
    this.referencia = referencia!;
    this.producto = producto!;
  }
}
