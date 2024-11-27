import { TipoProducto } from "./tipoProducto.model";
import { Proveedor } from "./proveedores.model";
import { Marca } from "./marca.model";
import {Promocion} from "./promociones.model";

export class Producto {
  id: number;
  nombre: string;
  costo: number;
  precioSinIVA: number;
  precioConIVA: number;
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
  promocion: Promocion;

  leyenda: string;

  constructor(
    id?: number,
    nombre?: string,
    costo?: number,
    precioSinIVA?: number,
    precioConIVA?: number,
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
    promocion?: Promocion,
    leyenda?: string
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.costo = costo!;
    this.precioSinIVA = precioSinIVA!;
    this.precioConIVA = precioConIVA!;
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
    this.promocion = promocion!;
    this.leyenda = leyenda!;
  }
}
