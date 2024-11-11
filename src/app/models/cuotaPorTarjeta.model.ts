export class CuotaPorTarjeta {
  id: number;
  interes: number;
  idCuota: number;
  idTarjeta: number;
  descuento: number;
  cantidadCuota: number;

  constructor(id?: number, interes?: number, idCuota?: number, idTarjeta?: number, descuento?: number, cantidadCuota?: number) {
    this.id = id!;
    this.interes = interes!;
    this.idCuota = idCuota!;
    this.idTarjeta = idTarjeta!;
    this.descuento = descuento!;
    this.cantidadCuota = cantidadCuota!;
  }
}
