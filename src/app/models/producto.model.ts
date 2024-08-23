import { TipoProducto } from "./tipoProducto.model"
import { Proveedor } from "./proveedores.model";
import { Marca } from "./marca.model";

export class Producto {
  id: number;
  nombre: string;
  costo: number;
  costoImpuesto: number;
  tipoProducto: TipoProducto;
  proveedor: Proveedor;
  marca: Marca;
  codigoBarra: string;
  descripcion: string;
  imgProducto: string;

  constructor(
    id?: number,
    nombre?: string,
    costo?: number,
    costoImpuesto?: number,
    tipoProducto?: TipoProducto,
    proveedor?: Proveedor,
    marca?: Marca,
    codigoBarra?: string,
    descripcion?: string,
    imgProducto?: string
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.costo = costo!;
    this.costoImpuesto = costoImpuesto!;
    this.tipoProducto = tipoProducto!;
    this.proveedor = proveedor!;
    this.marca = marca!;
    this.codigoBarra = codigoBarra!;
    this.descripcion = descripcion!;
    this.imgProducto = imgProducto!;
  }
}

