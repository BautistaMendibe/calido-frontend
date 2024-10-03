export class CuotaPorTarjeta {
  id: number;
  interes: number;
  idCuota: number;
  idTarjeta: number;

  constructor(id?: number, interes?: number, idCuota?: number, idTarjeta?: number) {
    this.id = id!;
    this.interes = interes!;
    this.idCuota = idCuota!;
    this.idTarjeta = idTarjeta!;
  }
}
