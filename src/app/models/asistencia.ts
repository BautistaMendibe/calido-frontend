import {Usuario} from "./usuario.model";

export class Asistencia {
  id: number;
  idUsuario: number;
  fecha: Date;
  horaEntrada: string;
  horaSalida: string;
  comentario: string;
  usuario: Usuario;

  constructor(
    id?: number,
    idUsuario?: number,
    fecha?: Date,
    horaEntrada?: string,
    horaSalida?: string,
    comentario?: string,
    usuario?: Usuario
  ) {
    this.id = id!;
    this.idUsuario = idUsuario!;
    this.fecha = fecha!;
    this.horaEntrada = horaEntrada!;
    this.horaSalida = horaSalida!;
    this.comentario = comentario!;
    this.usuario = usuario!;
  }
}
