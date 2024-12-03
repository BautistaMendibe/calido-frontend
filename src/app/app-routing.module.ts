import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./modules/auth/login/login.component";
import {HomeComponent} from "./modules/home/home.component";
import {ConsultarEmpleadosComponent} from "./modules/empleados/consultar-empleados/consultar-empleados.component";
import {ConsultarProductosComponent} from "./modules/productos/consultar-productos/consultar-productos.component";
import {ConsultarProveedoresComponent} from "./modules/proveedores/consultar-proveedores/consultar-proveedores.component";
import {
  ConsultarPromocionesComponent
} from "./modules/promociones/consultar-promociones/consultar-promociones.component";
import {NotificarPromocionComponent} from "./modules/promociones/notificar-promocion/notificar-promocion.component";
import {
  ConsultarConfiguracionesComponent
} from "./modules/configuraciones/consultar-configuraciones/consultar-configuraciones.component";
import {ConsultarAsistenciaComponent} from "./modules/empleados/consultar-asistencia/consultar-asistencia.component";
import {MarcarAsistenciaComponent} from "./modules/empleados/marcar-asistencia/marcar-asistencia.component";
import {RegistrarVentaComponent} from "./modules/venta/registrar-venta/registrar-venta.component";
import {ConsultarPedidosComponent} from "./modules/pedidos/consultar-pedidos/consultar-pedidos.component";
import {ConsultarClientesComponent} from "./modules/clientes/consultar-clientes/consultar-clientes.component";
import {
  ConsultarComprobanteComponent
} from "./modules/comprobante/consultar-comprobante/consultar-comprobante.component";
import {ConsultarCuentasCorrientesComponent} from "./modules/clientes/consultar-cuentas-corrientes/consultar-cuentas-corrientes.component";
import {
  RegistrarCuentaCorrienteComponent
} from "./modules/clientes/registrar-cuenta-corriente/registrar-cuenta-corriente.component";
import {ConsultarInventarioComponent} from "./modules/inventario/consultar-inventario/consultar-inventario.component";
import {ConsultarTarjetasComponent} from "./modules/tarjetas/consultar-tarjetas/consultar-tarjetas.component";
import {ConsultarVentasComponent} from "./modules/venta/consultar-ventas/consultar-ventas.component";
import {VisualizacionesComponent} from "./modules/Estadisticas/visualizaciones/visualizaciones.component";
import {VisualizacionesVentasComponent} from "./modules/Estadisticas/visualizaciones-ventas/visualizaciones-ventas.component";
import {VisualizacionesComprasComponent} from "./modules/Estadisticas/visualizaciones-compras/visualizaciones-compras.component";
import {ConsultarArqueoCajaComponent} from "./modules/gerencia/consultar-arqueo-caja/consultar-arqueo-caja.component";
import {ConsultarCajaComponent} from "./modules/gerencia/consultar-caja/consultar-caja.component";
import {DetalleArqueoComponent} from "./modules/gerencia/detalle-arqueo/detalle-arqueo.component";
import {RecuperarContrasenaComponent} from "./modules/auth/recuperar-contrasena/recuperar-contrasena.component";
import {GenerarReportesComponent} from "./modules/reportes/generar-reportes/generar-reportes.component";


const routes: Routes = [
  {path:'', component: HomeComponent},
  {path:'login', component: LoginComponent},
  {path:'consultar-empleados', component: ConsultarEmpleadosComponent},
  {path:'consultar-clientes', component: ConsultarClientesComponent},
  {path:'control-empleados', component: ConsultarAsistenciaComponent},
  {path:'consultar-cuentas-corrientes', component:ConsultarCuentasCorrientesComponent},
  {path:'registrar-cuenta-corriente', component: RegistrarCuentaCorrienteComponent},
  {path:'consultar-proveedores', component: ConsultarProveedoresComponent},
  {path:'consultar-productos', component: ConsultarProductosComponent},
  {path:'consultar-proveedores', component: ConsultarProveedoresComponent},
  {path:'consultar-promociones', component: ConsultarPromocionesComponent},
  {path:'notificar-promocion', component: NotificarPromocionComponent},
  {path:'consultar-configuraciones', component: ConsultarConfiguracionesComponent},
  {path:'consultar-productos', component: ConsultarProductosComponent},
  {path:'panel-empleado', component: MarcarAsistenciaComponent},
  {path:'registrar-venta', component: RegistrarVentaComponent},
  {path:'consultar-pedidos', component: ConsultarPedidosComponent},
  {path:'consultar-comprobante', component: ConsultarComprobanteComponent},
  {path:'consultar-inventario', component:ConsultarInventarioComponent},
  {path:'consultar-tarjetas', component:ConsultarTarjetasComponent},
  {path:'consultar-ventas', component: ConsultarVentasComponent},
  {path:'visualizaciones', component: VisualizacionesComponent},
  {path:'visualizaciones-ventas', component: VisualizacionesVentasComponent},
  {path:'visualizaciones-compras', component: VisualizacionesComprasComponent},
  {path:'consultar-arqueo-caja', component:ConsultarArqueoCajaComponent},
  {path:'consultar-cajas', component:ConsultarCajaComponent},
  {path: 'detalle-arqueo/:id', component:DetalleArqueoComponent},
  {path: 'recuperar-contrasena', component: RecuperarContrasenaComponent},
  {path: 'generar-reportes', component: GenerarReportesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
