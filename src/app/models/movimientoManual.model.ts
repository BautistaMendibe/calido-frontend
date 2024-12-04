import {FormaDePago} from "./formaDePago.model";

export class MovimientoManual {
  id: number;
  idArqueo: number;
  fechaMovimiento: Date;
  formaPago: FormaDePago;
  descripcion: string;
  tipoMovimiento: string;
  monto: number;

  constructor(id?: number, idArqueo?: number, fechaMovimiento?: Date, formaPago?: FormaDePago, descripcion?: string, tipoMovimiento?: string, monto?: number) {
    this.id = id!;
    this.idArqueo = idArqueo!;
    this.fechaMovimiento = fechaMovimiento!;
    this.formaPago = formaPago!;
    this.descripcion = descripcion!;
    this.tipoMovimiento = tipoMovimiento!;
    this.monto = monto!;
  }
}
