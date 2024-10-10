import {Producto} from "./producto.model";

export class Promocion {
  id: number;
  nombre: string;
  porcentajeDescuento: string;
  productos: Producto[];

  constructor(
    id?: number,
    nombre?: string,
    porcentajeDescuento?: string,
    productos?: Producto[],
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.porcentajeDescuento = porcentajeDescuento!;
    this.productos = productos!;
  }
}
