import {Producto} from "./producto.model";

export class Promocion {
  id: number;
  nombre: string;
  porcentajeDescuento: number;
  productos: Producto[];
  productosEliminados: Producto[];

  constructor(
    id?: number,
    nombre?: string,
    porcentajeDescuento?: number,
    productos?: Producto[],
    productosEliminados?: Producto[]
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.porcentajeDescuento = porcentajeDescuento!;
    this.productos = productos!;
    this.productosEliminados = productosEliminados!;
  }
}
