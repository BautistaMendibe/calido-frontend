export class FormaDePago {
  id: number;
  nombre: string;
  idAfip: number;

  // Atributos necesarios para el arqueo
  icon: string;
  totalIngresos: number;
  totalEgresos: number;
  detalleVisible: boolean;
  detallesIngresos: { concepto: string; monto: number }[];
  detallesEgresos: { concepto: string; monto: number }[];

  constructor(id?: number, nombre?: string, idAfip?: number, icon?: string, totalIngresos?: number, totalEgresos?: number, detalleVisible?: boolean, detallesIngresos?: { concepto: string; monto: number }[], detallesEgresos?: { concepto: string; monto: number }[]) {
    this.id = id!;
    this.nombre = nombre!;
    this.idAfip = idAfip!;
    this.icon = icon!;
    this.totalIngresos = totalIngresos!;
    this.totalEgresos = totalEgresos!;
    this.detalleVisible = detalleVisible!;
    this.detallesIngresos = detallesIngresos!;
    this.detallesEgresos = detallesEgresos!;
  }
}
