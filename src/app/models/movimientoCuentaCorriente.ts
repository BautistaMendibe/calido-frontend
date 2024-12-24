import {CuentaCorriente} from "./cuentaCorriente.model";
import {FormaDePago} from "./formaDePago.model";

export class MovimientoCuentaCorriente {
  id: number;
  idCuentaCorriente: number;
  idVenta: number;
  fecha: Date;
  monto: number;
  idFormaDePago: number;
  descripcion: string;

  cuentaCorriente: CuentaCorriente;
  formaDePago: FormaDePago;

  constructor(
    id?: number,
    idCuentaCorriente?: number,
    idVenta?: number,
    fecha?: Date,
    monto?: number,
    idFormaDePago?: number,
    cuentaCorriente?: CuentaCorriente,
    formaDePago?: FormaDePago,
    descripcion?: string
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
  }
}
