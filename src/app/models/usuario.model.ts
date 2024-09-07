import {TipoUsuario} from "./tipoUsuario.model";
import {Genero} from "./genero.model";
import {Domicilio} from "./domicilio.model";

export class Usuario {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  codigoPostal: number;
  tipoUsuario: TipoUsuario;
  idGenero: number;
  domicilio: Domicilio;
  dni: string;
  cuil: string;
  contrasena: string;

  constructor(
    id?: number,
    nombreUsuario?: string,
    nombre?: string,
    apellido?: string,
    fechaNacimiento?: Date,
    codigoPostal?: number,
    tipoUsuario?: TipoUsuario,
    idGenero?: number,
    domicilio?: Domicilio,
    dni?: string,
    cuil?: string,
    contrasena?: string
  ) {
    this.id = id!;
    this.nombreUsuario = nombreUsuario!;
    this.nombre = nombre!;
    this.apellido = apellido!;
    this.fechaNacimiento = fechaNacimiento!;
    this.codigoPostal = codigoPostal!;
    this.tipoUsuario = tipoUsuario!;
    this.idGenero = idGenero!;
    this.domicilio = domicilio!;
    this.dni = dni!;
    this.cuil = cuil!;
    this.contrasena = contrasena!;
  }
}
