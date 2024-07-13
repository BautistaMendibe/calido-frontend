export class Promocion {
  id: number;
  nombre: string;
  porcentajeDescuento: string;
  idProducto: number;

  constructor(
    id?: number,
    nombre?: string,
    porcentajeDescuento?: string,
    idProducto?: number
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.porcentajeDescuento = porcentajeDescuento!;
    this.idProducto = idProducto!;
  }
}
