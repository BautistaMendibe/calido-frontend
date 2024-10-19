import {Usuario} from "./usuario.model";
import {EstadoLicencia} from "./estadoLicencia.model";

export class Licencia {
  id: number;
  idUsuario: number;
  fechaInicio: Date;
  fechaFin: Date;
  idMotivoLicencia: number;
  idEstadoLicencia: number;
  comentario: string;

  usuario: Usuario;
  estadoLicencia: EstadoLicencia;

  constructor(id?: number, idUsuario?: number, fechaInicio?: Date, fechaFin?: Date, idMotivoLicencia?: number, idEstadoLicencia?: number, comentario?: string, usuario?: Usuario, estadoLicencia?: EstadoLicencia) {
    this.id = id!;
    this.idUsuario = idUsuario!;
    this.fechaInicio = fechaInicio!;
    this.fechaFin = fechaFin!;
    this.idMotivoLicencia = idMotivoLicencia!;
    this.idEstadoLicencia = idEstadoLicencia!;
    this.comentario = comentario!;
    this.usuario = usuario!;
    this.estadoLicencia = estadoLicencia!;
  }
}
