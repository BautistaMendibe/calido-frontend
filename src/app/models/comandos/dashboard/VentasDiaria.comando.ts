export class VentasDiariaComando {
  hora: string;
  totalHoy: number;
  totalAyer: number;
  totalDelDiaHoy: number;
  totalDelDiaAyer: number;

  constructor(hora?: string, totalHoy?: number, totalAyer?: number, totalDelDiaHoy?: number, totalDelDiaAyer?: number) {
    this.hora = hora!;
    this.totalHoy = totalHoy!;
    this.totalAyer = totalAyer!;
    this.totalDelDiaHoy = totalDelDiaHoy!;
    this.totalDelDiaAyer = totalDelDiaAyer!;
  }
}
