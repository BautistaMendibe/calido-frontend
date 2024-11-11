import {Usuario} from "./usuario.model";

export class Configuracion {
  id: number;
  idUsuario: number;
  razonSocial: string;
  calle: string;
  numero: number;
  ciudad: string;
  provincia: string;
  codigoPostal: number;
  cuit: string;
  fechaInicioActividades: string;
  condicionIva: string;
  logo: string;
  contrasenaInstagram: string;
  usuarioInstagram: string;
  usuario: Usuario;
  facturacionAutomatica: boolean;

  constructor(
    id?: number,
    idUsuario?: number,
    razonSocial?: string,
    cuit?: string,
    fechaInicioActividades?: string,
    condicionIva?: string,
    logo?: string | null,
    contrasenaInstagram?: string,
    usuarioInstagram?: string,
    usuario?: Usuario,
    calle?: string,
    numero?: number,
    ciudad?: string,
    provincia?: string,
    codigoPostal?: number,
    facturacionAutomatica?: boolean
) {
    this.id = id!;
    this.idUsuario = idUsuario!;
    this.razonSocial = razonSocial!;
    this.cuit = cuit!;
    this.fechaInicioActividades = fechaInicioActividades!;
    this.condicionIva = condicionIva!;
    this.logo = logo!;
    this.contrasenaInstagram = contrasenaInstagram!;
    this.usuarioInstagram = usuarioInstagram!;
    this.usuario = usuario!;
    this.calle = calle!;
    this.numero = numero!;
    this.ciudad = ciudad!;
    this.provincia = provincia!;
    this.codigoPostal = codigoPostal!;
    this.facturacionAutomatica = facturacionAutomatica!;
  }
}
