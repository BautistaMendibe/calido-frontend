import {Usuario} from "./usuario.model";
import {DetalleComprobante} from "./detalleComprobante.model";
import {TipoComprobante} from "./tipoComprobante.model";

export class Comprobante {
  id: number;
  numerocomprobante: number;
  fechaEmision: Date;
  idProveedor: number;
  observaciones: string;
  total: number;
  idResponsable: number;
  idReceptor: number;
  idTipoComprobante: number;

  detalleComprobante: DetalleComprobante[];
  responsable: Usuario;
  receptor: Usuario;
  tipoComprobante: TipoComprobante;

  constructor(
    id?: number,
    numerocomprobante?: number,
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
    tipoComprobante?: TipoComprobante
  ) {
    this.id = id!;
    this.numerocomprobante = numerocomprobante!;
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
  }
}
