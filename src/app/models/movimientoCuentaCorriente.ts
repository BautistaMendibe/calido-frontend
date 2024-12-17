import {CuentaCorriente} from "./cuentaCorriente.model";

export class MovimientoCuentaCorriente {
  id: number;
  idCuentaCorriente: number;
  fecha: Date;
  monto: number;
  descripcion: string;

  cuentaCorriente: CuentaCorriente;

  constructor(
    id?: number,
    idCuentaCorriente?: number,
    fecha?: Date,
    monto?: number,
    descripcion?: string,
    cuentaCorriente?: CuentaCorriente
  ) {
    this.id = id!;
    this.idCuentaCorriente = idCuentaCorriente!;
    this.fecha = fecha!;
    this.monto = monto!;
    this.descripcion = descripcion!;
    this.cuentaCorriente = cuentaCorriente!;
  }
}
