import {Cuota} from "./Cuota.model";

export class CuotaPorTarjeta {
  id: number;
  interes: number;
  idCuota: number;
  idTarjeta: number;
  recargo: number;
  descuento: number;

  cuota: Cuota;

  constructor(id?: number, interes?: number, idCuota?: number, idTarjeta?: number, cuota?: Cuota, recargo?: number, descuento?: number) {
    this.id = id!;
    this.interes = interes!;
    this.idCuota = idCuota!;
    this.idTarjeta = idTarjeta!;
    this.cuota = cuota!;
    this.recargo = recargo!;
    this.descuento = descuento!;
  }
}
