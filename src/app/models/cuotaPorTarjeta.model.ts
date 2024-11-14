export class CuotaPorTarjeta {
  id: number;
  interes: number;
  idCuota: number;
  idTarjeta: number;
  cantidadCuota: number;

  constructor(id?: number, interes?: number, idCuota?: number, idTarjeta?: number, cantidadCuota?: number) {
    this.id = id!;
    this.interes = interes!;
    this.idCuota = idCuota!;
    this.idTarjeta = idTarjeta!;
    this.cantidadCuota = cantidadCuota!;
  }
}
