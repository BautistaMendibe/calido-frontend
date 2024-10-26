import {EstadoArqueo} from "./estadoArqueo.model";
import {Caja} from "./Caja.model";

export class Arqueo {
  id: number;
  fechaApertura: Date;
  horaApertura: Date;
  horaCierre: Date;
  sistema: number;
  usuario: number;
  diferencia: number;
  idEstadoArqueo: number;
  idCaja: number;

  estadoArqueo: EstadoArqueo;
  caja: Caja;

  constructor(
    id?: number,
    fechaApertura?: Date,
    horaApertura?: Date,
    horaCierre?: Date,
    sistema?: number,
    usuario?: number,
    diferencia?: number,
    idEstadoArqueo?: number,
    idCaja?: number,
    estadoArqueo?: EstadoArqueo,
    caja?: Caja
  ) {
    this.id = id!;
    this.fechaApertura = fechaApertura!;
    this.horaApertura = horaApertura!;
    this.horaCierre = horaCierre!;
    this.sistema = sistema!;
    this.usuario = usuario!;
    this.diferencia = diferencia!;
    this.idEstadoArqueo = idEstadoArqueo!;
    this.idCaja = idCaja!;
    this.estadoArqueo = estadoArqueo!;
    this.caja = caja!;
  }
}
