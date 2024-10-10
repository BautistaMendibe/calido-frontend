import { TipoProducto } from "./tipoProducto.model";
import { Proveedor } from "./proveedores.model";
import { Marca } from "./marca.model";

export class Producto {
  id: number;
  nombre: string;
  costo: number;
  precioSinIVA: number;
  tipoProducto: TipoProducto;
  proveedor: Proveedor;
  marca: Marca;
  seleccionadoParaVenta: boolean;
  cantidadEnStock: number;
  cantidadSeleccionada: number;
  codigoBarra: string;
  descripcion: string;
  imgProducto: string;
  subTotalVenta: number;
  cantidad: number;
  margenGanancia: number;
  precioConIva: number;
  precioFinalVenta: number;
  descuentoPromocion: number;
  descuentoTarjeta: number;

  estaEnPromocion: boolean;

  constructor(
    id?: number,
    nombre?: string,
    costo?: number,
    precioSinIVA?: number,
    tipoProducto?: TipoProducto,
    proveedor?: Proveedor,
    seleccionadoParaVenta?: boolean,
    cantidadEnStock?: number,
    cantidadSeleccionada?: number,
    marca?: Marca,
    codigoBarra?: string,
    descripcion?: string,
    margenGanancia?: number,
    imgProducto?: string,
    subTotalVenta?: number,
    cantidad?: number,
    precioConIva?: number,
    precioFinalVenta?: number,
    descuentoPromocion?: number,
    descuentoTarjeta?: number,
    estaEnPromocion?: boolean,
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.costo = costo!;
    this.precioSinIVA = precioSinIVA!;
    this.tipoProducto = tipoProducto!;
    this.proveedor = proveedor!;
    this.marca = marca!;
    this.codigoBarra = codigoBarra!;
    this.descripcion = descripcion!;
    this.imgProducto = imgProducto!;
    this.seleccionadoParaVenta = !seleccionadoParaVenta;
    this.cantidadEnStock = cantidadEnStock!;
    this.cantidadSeleccionada = cantidadSeleccionada!;
    this.margenGanancia = margenGanancia!;
    this.subTotalVenta = subTotalVenta!;
    this.cantidad = cantidad!;
    this.precioConIva = precioConIva!;
    this.precioFinalVenta = precioFinalVenta!;
    this.descuentoPromocion = descuentoPromocion!;
    this.descuentoTarjeta = descuentoTarjeta!;
    this.estaEnPromocion = estaEnPromocion!;
  }
}
