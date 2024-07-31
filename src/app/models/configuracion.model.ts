export class Configuracion {
  id: number;
  idUsuario: number;
  razonSocial: string;
  domicilioComercial: string;
  cuit: string;
  fechaInicioActividades: string;
  condicionIva: string;
  logo: Buffer;
  contrasenaInstagram: string;

  constructor(
    id?: number,
    idUsuario?: number,
    razonSocial?: string,
    domicilioComercial?: string,
    cuit?: string,
    fechaInicioActividades?: string,
    condicionIva?: string,
    logo?: Buffer,
    contrasenaInstagram?: string
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
  }
}
