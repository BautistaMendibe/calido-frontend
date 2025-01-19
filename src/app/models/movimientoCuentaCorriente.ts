import {CuentaCorriente} from "./cuentaCorriente.model";
import {FormaDePago} from "./formaDePago.model";
import {TipoMovimientoCuentaCorriente} from "./tipoMovimientoCuentaCorriente.model";

export class MovimientoCuentaCorriente {
  id: number;
  idCuentaCorriente: number;
  idVenta: number;
  fecha: Date;
  monto: number;
  idFormaDePago: number;
  descripcion: string;
  idTipoMovimientoCuentaCorriente: number;

  cuentaCorriente: CuentaCorriente;
  formaDePago: FormaDePago;
  tipoMovimientoCuentaCorriente: TipoMovimientoCuentaCorriente;

  constructor(
    id?: number,
    idCuentaCorriente?: number,
    idVenta?: number,
    fecha?: Date,
    monto?: number,
    idFormaDePago?: number,
    cuentaCorriente?: CuentaCorriente,
    formaDePago?: FormaDePago,
    descripcion?: string,
    idTipoMovimientoCuentaCorriente?: number,
    tipoMovimientoCuentaCorriente?: TipoMovimientoCuentaCorriente
  ) {
    this.id = id!;
    this.idCuentaCorriente = idCuentaCorriente!;
    this.idVenta = idVenta!;
    this.fecha = fecha!;
    this.monto = monto!;
    this.idFormaDePago = idFormaDePago!;
    this.cuentaCorriente = cuentaCorriente!;
    this.formaDePago = formaDePago!;
    this.descripcion = descripcion!;
    this.idTipoMovimientoCuentaCorriente = idTipoMovimientoCuentaCorriente!;
    this.tipoMovimientoCuentaCorriente = tipoMovimientoCuentaCorriente!;
  }
}
