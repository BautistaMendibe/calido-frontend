import {FormaDePago} from "./formaDePago.model";
import {TipoMovimientoArqueo} from "./tipoMovimientoArqueo.model";

export class MovimientoManual {
  id: number;
  idArqueo: number;
  fechaMovimiento: Date;
  formaPago: FormaDePago;
  descripcion: string;
  tipoMovimiento: string;
  monto: number;
  idTipoMovimientoArqueo: number;

  tipoMovimientoArqueo: TipoMovimientoArqueo;

  constructor(id?: number, idArqueo?: number, fechaMovimiento?: Date, formaPago?: FormaDePago, descripcion?: string, tipoMovimiento?: string, monto?: number, idTipoMovimientoArqueo?: number, tipoMovimientoArqueo?: TipoMovimientoArqueo) {
    this.id = id!;
    this.idArqueo = idArqueo!;
    this.fechaMovimiento = fechaMovimiento!;
    this.formaPago = formaPago!;
    this.descripcion = descripcion!;
    this.tipoMovimiento = tipoMovimiento!;
    this.monto = monto!;
    this.idTipoMovimientoArqueo = idTipoMovimientoArqueo!;
    this.tipoMovimientoArqueo = tipoMovimientoArqueo!;
  }
}
