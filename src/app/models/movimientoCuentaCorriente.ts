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
  idTipoMovimientoCuentaCorriente: number;
  comprobante: string;
  anulado: number;
  devuelto: number;
  idCaja: number;

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
    idTipoMovimientoCuentaCorriente?: number,
    tipoMovimientoCuentaCorriente?: TipoMovimientoCuentaCorriente,
    comprobante?: string,
    anulado?: number,
    devuelto?: number,
    idCaja?: number
  ) {
    this.id = id!;
    this.idCuentaCorriente = idCuentaCorriente!;
    this.idVenta = idVenta!;
    this.fecha = fecha!;
    this.monto = monto!;
    this.idFormaDePago = idFormaDePago!;
    this.cuentaCorriente = cuentaCorriente!;
    this.formaDePago = formaDePago!;
    this.idTipoMovimientoCuentaCorriente = idTipoMovimientoCuentaCorriente!;
    this.tipoMovimientoCuentaCorriente = tipoMovimientoCuentaCorriente!;
    this.comprobante = comprobante!;
    this.anulado = anulado!;
    this.devuelto = devuelto!;
    this.idCaja = idCaja!;
  }
}
