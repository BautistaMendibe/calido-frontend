import {Usuario} from "./usuario.model";

export class Configuracion {
  id: number;
  idUsuario: number;
  razonSocial: string;
  domicilioComercial: string;
  cuit: string;
  fechaInicioActividades: string;
  condicionIva: string;
  logo: string;
  contrasenaInstagram: string;
  usuarioInstagram: string;
  usuario: Usuario;

  constructor(
    id?: number,
    idUsuario?: number,
    razonSocial?: string,
    domicilioComercial?: string,
    cuit?: string,
    fechaInicioActividades?: string,
    condicionIva?: string,
    logo?: string | null,
    contrasenaInstagram?: string,
    usuarioInstagram?: string,
    usuario?: Usuario
  ) {
    this.id = id!;
    this.idUsuario = idUsuario!;
    this.razonSocial = razonSocial!;
    this.domicilioComercial = domicilioComercial!;
    this.cuit = cuit!;
    this.fechaInicioActividades = fechaInicioActividades!;
    this.condicionIva = condicionIva!;
    this.logo = logo!;
    this.contrasenaInstagram = contrasenaInstagram!;
    this.usuarioInstagram = usuarioInstagram!;
    this.usuario = usuario!;
  }
}
