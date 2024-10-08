import {Usuario} from "./usuario.model";
import {DetalleComprobante} from "./detalleComprobante.model";
import {TipoComprobante} from "./tipoComprobante.model";
import {Pedido} from "./pedido.model";
import {Proveedor} from "./proveedores.model";

export class Comprobante {
  id: number;
  numeroComprobante: number;
  fechaEmision: Date;
  idProveedor: number;
  observaciones: string;
  total: number;
  idResponsable: number;
  idReceptor: number;
  idTipoComprobante: number;
  idPedido: number;

  detalleComprobante: DetalleComprobante[];
  responsable: Usuario;
  receptor: Usuario;
  tipoComprobante: TipoComprobante;
  pedido: Pedido;
  proveedor: Proveedor;

  constructor(
    id?: number,
    numeroComprobante?: number,
    fechaEmision?: Date,
    idProveedor?: number,
    observaciones?: string,
    total?: number,
    idResponsable?: number,
    idReceptor?: number,
    detalleComprobante?: DetalleComprobante[],
    responsable?: Usuario,
    receptor?: Usuario,
    idTipoComprobante?: number,
    tipoComprobante?: TipoComprobante,
    idPedido?: number,
    pedido?: Pedido,
    proveedor?: Proveedor
  ) {
    this.id = id!;
    this.numeroComprobante = numeroComprobante!;
    this.fechaEmision = fechaEmision!;
    this.idProveedor = idProveedor!;
    this.observaciones = observaciones!;
    this.total = total!;
    this.idResponsable = idResponsable!;
    this.idReceptor = idReceptor!;
    this.detalleComprobante = detalleComprobante!;
    this.responsable = responsable!;
    this.receptor = receptor!;
    this.idTipoComprobante = idTipoComprobante!;
    this.tipoComprobante = tipoComprobante!;
    this.idPedido = idPedido!
    this.pedido = pedido!;
    this.proveedor = proveedor!;
  }
}
