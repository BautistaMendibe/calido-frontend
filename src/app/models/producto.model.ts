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
  seleccionadoParaVenta: boolean;
  cantidadEnStock: number;
  cantidadSeleccionada: number;

  constructor(
    id?: number,
    nombre?: string,
    costo?: number,
    costoIva?: number,
    tipoProducto?: TipoProducto,
    proveedor?: Proveedor,
    marca?: Marca,
    seleccionadoParaVenta?: boolean,
    cantidadEnStock?: number,
    cantidadSeleccionada?: number
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.costo = costo!; // Asegura hasta 2 decimales
    this.costoIva = costoIva!; // Asegura hasta 2 decimales
    this.tipoProducto = tipoProducto!;
    this.proveedor = proveedor!;
    this.marca = marca!;
    this.seleccionadoParaVenta = !seleccionadoParaVenta;
    this.cantidadEnStock = cantidadEnStock!;
    this.cantidadSeleccionada = cantidadSeleccionada!;
  }
}

