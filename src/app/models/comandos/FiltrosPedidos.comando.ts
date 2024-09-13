import {Proveedor} from "../proveedores.model";
import {EstadoPedido} from "../estadoPedido";

export class FiltrosPedidos {
  pedido?: number;
  proveedor?: Proveedor;
  fechaEmisionDesde?: Date;
  fechaEmisionHasta?: Date;
  estado?: EstadoPedido;
}
