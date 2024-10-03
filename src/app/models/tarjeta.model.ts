import {TipoTarjeta} from "./tipoTarjeta.model";
import {CuotaPorTarjeta} from "./cuotaPorTarjeta.model";

export class Tarjeta {
  id: number;
  nombre: string;
  idTipoTarjeta: number;

  tipoTarjeta: TipoTarjeta;
  cuotaPorTarjeta: CuotaPorTarjeta[];

  constructor(id?: number, nombre?: string, idTipoTarjeta?: number, tipoTarjeta?: TipoTarjeta, cuotaPorTarjeta?: CuotaPorTarjeta[]) {
    this.id = id!;
    this.nombre = nombre!;
    this.idTipoTarjeta = idTipoTarjeta!;
    this.tipoTarjeta = tipoTarjeta!;
    this.cuotaPorTarjeta = cuotaPorTarjeta!;
  }
}
