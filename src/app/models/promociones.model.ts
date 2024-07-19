import {Producto} from "./producto.model";

export class Promocion {
  id: number;
  nombre: string;
  porcentajeDescuento: string;
  idProducto: number;

  /*
  * Al usuario se le dará la posibilidad de modificar el producto completo
  * al cual aplica la promoción, por lo que es conveniente tener el objeto.
   */
  producto: Producto;

  constructor(
    id?: number,
    nombre?: string,
    porcentajeDescuento?: string,
    idProducto?: number,
    producto?: Producto
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.porcentajeDescuento = porcentajeDescuento!;
    this.idProducto = idProducto!;
    this.producto = producto!;
  }
}
