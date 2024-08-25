import {Producto} from "./producto.model";
import {Venta} from "./venta.model";

export class DetalleVenta {
  id: number;
  cantidad: number;
  subTotal: number;
  venta: Venta;
  producto: Producto;

  constructor(id?: number, cantidad?: number, subTotal?: number, venta?: Venta, producto?: Producto) {
    this.id = id!;
    this.cantidad = cantidad!;
    this.subTotal = subTotal!;
    this.venta = venta!;
    this.producto = producto!;
  }
}
