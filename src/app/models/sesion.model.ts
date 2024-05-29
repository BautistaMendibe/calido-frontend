import { Usuario } from './usuario.model';
import {TipoUsuario} from "./tipoUsuario.model";

export interface Sesion {
  tipoUsuario: TipoUsuario[];
  usuario: Usuario;
}
