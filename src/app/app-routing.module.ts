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
import {authGuard} from "./auth.guard";
import {GenerarReportesComponent} from "./modules/reportes/generar-reportes/generar-reportes.component";

/**
 * Rutas de la aplicación
 * path: ruta de la aplicación
 * component: componente que se renderizará en la ruta
 * canActivate: indicar si el componente debe mostrarse según roles
 * data: roles permitidos para acceder a la ruta
 */
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado', 'Cajero', 'Vendedor'] },
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'consultar-empleados',
    component: ConsultarEmpleadosComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-clientes',
    component: ConsultarClientesComponent
  },
  {
    path: 'control-empleados',
    component: ConsultarAsistenciaComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-cuentas-corrientes',
    component: ConsultarCuentasCorrientesComponent
  },
  {
    path: 'registrar-cuenta-corriente',
    component: RegistrarCuentaCorrienteComponent,
    canActivate: [authGuard],
    data: { roles: ['Cajero', 'Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-proveedores',
    component: ConsultarProveedoresComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-productos',
    component: ConsultarProductosComponent
  },
  {
    path: 'consultar-promociones',
    component: ConsultarPromocionesComponent
  },
  {
    path: 'notificar-promocion',
    component: NotificarPromocionComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-configuraciones',
    component: ConsultarConfiguracionesComponent,
    canActivate: [authGuard],
    data: { roles: ['Encargado'] },
  },
  {
    path: 'panel-empleado',
    component: MarcarAsistenciaComponent
  },
  {
    path: 'registrar-venta',
    component: RegistrarVentaComponent,
    canActivate: [authGuard],
    data: { roles: ['Cajero', 'Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-pedidos',
    component: ConsultarPedidosComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-comprobante',
    component: ConsultarComprobanteComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-inventario',
    component: ConsultarInventarioComponent
  },
  {
    path: 'consultar-tarjetas',
    component: ConsultarTarjetasComponent
  },
  {
    path: 'consultar-ventas',
    component: ConsultarVentasComponent,
    canActivate: [authGuard],
    data: { roles: ['Vendedor', 'Cajero', 'Administrador', 'Encargado'] },
  },
  {
    path: 'visualizaciones',
    component: VisualizacionesComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'visualizaciones-ventas',
    component: VisualizacionesVentasComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'visualizaciones-compras',
    component: VisualizacionesComprasComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'consultar-arqueo-caja',
    component: ConsultarArqueoCajaComponent
  },
  {
    path: 'consultar-cajas',
    component: ConsultarCajaComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'detalle-arqueo/:id',
    component: DetalleArqueoComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  },
  {
    path: 'recuperar-contrasena',
    component: RecuperarContrasenaComponent
  },
  {
    path: 'generar-reportes',
    component: GenerarReportesComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Encargado'] },
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
