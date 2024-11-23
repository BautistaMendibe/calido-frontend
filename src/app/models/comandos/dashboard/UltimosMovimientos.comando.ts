export class UltimosMovimientosComando {
  hora: string;
  cantidad: number;
  tipo: string;
  dia: string;
  imagen: string;

  constructor(hora?: string, cantidad?: number, tipo?: string, dia?: string, imagen?: string) {
    this.hora = hora!;
    this.cantidad = cantidad!;
    this.tipo = tipo!;
    this.dia = dia!;
    this.imagen = imagen!;
  }
}
