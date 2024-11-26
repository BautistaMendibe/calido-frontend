export class VentasDiariaComando {
  hora: string;
  total: number;
  totalDelDia: number;

  constructor(hora?: string, total?: number, totalDelDia?: number) {
    this.hora = hora!;
    this.total = total!;
    this.totalDelDia = totalDelDia!;
  }
}
