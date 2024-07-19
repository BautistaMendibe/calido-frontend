import { TipoProducto } from "./tipoProducto.model"
import { Proveedor } from "./proveedores.model";
import { Marca } from "./marca.model";

export class Producto {
  id: number;
  nombre: string;
  costo: number;
  costoIva: number;
  tipoProducto: TipoProducto;
  proveedor: Proveedor;
  marca: Marca;

  constructor(
    id?: number,
    nombre?: string,
    costo?: number,
    costoIva?: number,
    TipoProducto?: TipoProducto,
    proveedor?: Proveedor,
    marca?: Marca
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.marca = marca!;
    this.costo = parseFloat(costo!.toFixed(2)); // 2 decimales
    this.costoIva = parseFloat(costoIva!.toFixed(2)); // 2 decimales
    this.tipoProducto = TipoProducto!;
    this.proveedor = proveedor!;
  }
}
