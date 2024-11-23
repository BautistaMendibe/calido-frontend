export class UltimosMovimientosComando {
  hora: string;
  cantidad: number;
  tipo: string;
  dia: string;
  icon: string;
  codigo: number;

  constructor(hora?: string, cantidad?: number, tipo?: string, dia?: string, icon?: string, codigo?: number) {
    this.hora = hora!;
    this.cantidad = cantidad!;
    this.tipo = tipo!;
    this.dia = dia!;
    this.icon = icon!;
    this.codigo = codigo!;
  }
}
