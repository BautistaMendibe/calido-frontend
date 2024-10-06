export class CuotaPorTarjeta {
  id: number;
  interes: number;
  idCuota: number;
  idTarjeta: number;
  recargo: number;
  descuento: number;

  constructor(id?: number, interes?: number, idCuota?: number, idTarjeta?: number, recargo?: number, descuento?: number) {
    this.id = id!;
    this.interes = interes!;
    this.idCuota = idCuota!;
    this.idTarjeta = idTarjeta!;
    this.recargo = recargo!;
    this.descuento = descuento!;
  }
}
