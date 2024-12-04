export class RecuperarContrasena {
  correo: string;
  contrasena: string;
  token: string;

  constructor(correo?: string, contrasena?: string, token?: string) {
    this.correo = correo!;
    this.contrasena = contrasena!;
    this.token = token!;
  }
}
