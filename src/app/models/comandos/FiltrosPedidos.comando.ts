import {Proveedor} from "../proveedores.model";

export class FiltrosPedidos {
  pedido?: number;
  proveedor?: Proveedor;
  fechaEmisionDesde?: Date;
  fechaEmisionHasta?: Date;
}
