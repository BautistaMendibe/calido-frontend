export class VentasDiariasComando {
  hora: string;
  cantidad: number;

  constructor(hora?: string, cantidad?: number) {
    this.hora = hora!;
    this.cantidad = cantidad!;
  }
}
