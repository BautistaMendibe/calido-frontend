import {FormaDePago} from "./formaDePago.model";

export class MovimientoManual {
  id: number;
  tipoMovimiento: number;
  formaPago: FormaDePago;
  descripcion: string;
  monto: number;

  constructor(id: number, tipoMovimiento?: number, formaPago?: FormaDePago, descripcion?: string, monto?: number) {
    this.id = id;
    this.tipoMovimiento = tipoMovimiento!;
    this.formaPago = formaPago!;
    this.descripcion = descripcion!;
    this.monto = monto!;
  }
}
