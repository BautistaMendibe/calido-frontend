import {Proveedor} from "../proveedores.model";
import {Usuario} from "../usuario.model";

export class FiltrosComprobantes {
  comprobante?: number;
  proveedor?: Proveedor;
  fechaEmisionDesde?: Date;
  fechaEmisionHasta?: Date;
  responsable?: Usuario;
  tipoComprobante?: number;
}
