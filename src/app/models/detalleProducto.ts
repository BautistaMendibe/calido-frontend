import {Producto} from "./producto.model";
import {Proveedor} from "./proveedores.model";

export class DetalleProducto {
  id: number;
  cantEnInventario: number;
  idProducto: number;

  producto: Producto;
  proveedor: Proveedor;

  constructor(id?: number, cantEnInventario?: number, idProducto?: number, producto?: Producto, proveedor?: Proveedor) {
    this.id = id!;
    this.cantEnInventario = cantEnInventario!;
    this.idProducto = idProducto!;
    this.producto = producto!;
    this.proveedor = proveedor!;
  }
}
