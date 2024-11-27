import {EstadoArqueo} from "./estadoArqueo.model";
import {Caja} from "./Caja.model";

export class Arqueo {
  id: number;
  fechaApertura: Date;
  horaApertura: Date;
  montoInicial: number;
  horaCierre: Date;
  sistema: number;
  usuario: number;
  diferencia: number;
  idEstadoArqueo: number;
  idCaja: number;

  estadoArqueo: EstadoArqueo;
  caja: Caja;

  montoSistemaCaja: number;
  montoSistemaOtros: number;
  diferenciaOtros: number;

  constructor(
    id?: number,
    fechaApertura?: Date,
    horaApertura?: Date,
    montoInicial?: number,
    horaCierre?: Date,
    sistema?: number,
    usuario?: number,
    diferencia?: number,
    idEstadoArqueo?: number,
    idCaja?: number,
    estadoArqueo?: EstadoArqueo,
    caja?: Caja,
    montoSistemaCaja?: number,
    montoSistemaOtros?: number,
    diferenciaOtros?: number
  ) {
    this.id = id!;
    this.fechaApertura = fechaApertura!;
    this.horaApertura = horaApertura!;
    this.montoInicial = montoInicial!;
    this.horaCierre = horaCierre!;
    this.sistema = sistema!;
    this.usuario = usuario!;
    this.diferencia = diferencia!;
    this.idEstadoArqueo = idEstadoArqueo!;
    this.idCaja = idCaja!;
    this.estadoArqueo = estadoArqueo!;
    this.caja = caja!;
    this.montoSistemaCaja = montoSistemaCaja!;
    this.montoSistemaOtros = montoSistemaOtros!;
    this.diferenciaOtros = diferenciaOtros!;
  }
}
