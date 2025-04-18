import {TipoUsuario} from "./tipoUsuario.model";
import {Domicilio} from "./domicilio.model";
import {Rol} from "./Rol";

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
  cuit: string;
  cuil: string;
  contrasena: string;
  roles: Rol[];
  mail: string;
  idCondicionIva: number;

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
    cuit?: string,
    contrasena?: string,
    roles?: Rol[],
    mail?: string,
    idCondicionIva?: number
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
    this.cuit = cuit!;
    this.contrasena = contrasena!;
    this.roles = roles!;
    this.mail = mail!;
    this.idCondicionIva = idCondicionIva!;
  }
}
