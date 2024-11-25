export class VentasMensuales {
  mes: string;
  total: number;

  constructor(mes?: string, total?: number) {
    this.mes = mes!;
    this.total = total!;
  }
}
