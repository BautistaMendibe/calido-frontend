export class ProductoStockLimitadoComando {
  id: number;
  nombre: string;
  proveedor: string;
  cantidadEnStock: number;
  codigoBarra: string;
  imgProducto: string;


  constructor(
    id?: number,
    nombre?: string,
    proveedor?: string,
    cantidadEnStock?: number,
    codigoBarra?: string,
    imgProducto?: string,
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.proveedor = proveedor!;
    this.codigoBarra = codigoBarra!;
    this.imgProducto = imgProducto!;
    this.cantidadEnStock = cantidadEnStock!;
  }
}
