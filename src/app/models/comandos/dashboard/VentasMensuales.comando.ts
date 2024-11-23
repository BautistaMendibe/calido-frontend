export class VentasMensualesComando {
  mes: string;
  cantidad: number;

  constructor(mes?: string, cantidad?: number) {
    this.mes = mes!;
    this.cantidad = cantidad!;
  }
}
