import {LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HealthService} from "./services/health.service";
import { LoginComponent } from './modules/auth/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { HeaderComponent } from './core/header/header.component';
import {MaterialModule} from "./shared/material-module";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { HomeComponent } from './modules/home/home.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {UsuariosService} from "./services/usuarios.service";
import {AuthService} from "./services/auth.service";
import { ConsultarEmpleadosComponent } from './modules/empleados/consultar-empleados/consultar-empleados.component';
import { RegistrarEmpleadosComponent } from './modules/empleados/registrar-empleados/registrar-empleados.component';
import { ConsultarProveedoresComponent } from './modules/proveedores/consultar-proveedores/consultar-proveedores.component';
import { RegistrarProveedorComponent } from './modules/proveedores/registrar-proveedor/registrar-proveedor.component';
import { ConsultarPromocionesComponent } from './modules/promociones/consultar-promociones/consultar-promociones.component';
import { RegistrarPromocionComponent } from './modules/promociones/registrar-promocion/registrar-promocion.component';
import { NotificarPromocionComponent } from './modules/promociones/notificar-promocion/notificar-promocion.component';
import {PickerComponent} from "@ctrl/ngx-emoji-mart";
import { ConsultarConfiguracionesComponent } from './modules/configuraciones/consultar-configuraciones/consultar-configuraciones.component';
import { ConsultarProductosComponent } from './modules/productos/consultar-productos/consultar-productos.component';
import { RegistrarProductoComponent } from './modules/productos/registrar-producto/registrar-producto.component';
import { MessagesComponent } from './shared/messages/messages.component';
import {MatDialogActions, MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {NgxMaskDirective, NgxMaskPipe, provideNgxMask} from "ngx-mask";
import {AuthInterceptor} from "./interceptors/auth.interceptor";
import { RegistrarVentaComponent } from './modules/venta/registrar-venta/registrar-venta.component';
import { MarcarAsistenciaComponent } from './modules/empleados/marcar-asistencia/marcar-asistencia.component';
import { ConsultarAsistenciaComponent } from './modules/empleados/consultar-asistencia/consultar-asistencia.component';
import {DatePipe, registerLocaleData} from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { RegistrarAsistenciaComponent } from './modules/empleados/registrar-asistencia/registrar-asistencia.component';
import { RegistrarPedidoComponent } from './modules/pedidos/registrar-pedido/registrar-pedido.component';
import { ConsultarPedidosComponent } from './modules/pedidos/consultar-pedidos/consultar-pedidos.component';
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import { RegistrarClientesComponent } from './modules/clientes/registrar-clientes/registrar-clientes.component';
import { ConsultarClientesComponent } from './modules/clientes/consultar-clientes/consultar-clientes.component';
import { RegistrarComprobanteComponent } from './modules/comprobante/registrar-comprobante/registrar-comprobante.component';
import { ConsultarComprobanteComponent } from './modules/comprobante/consultar-comprobante/consultar-comprobante.component';
import {ConsultarCuentasCorrientesComponent} from "./modules/clientes/consultar-cuentas-corrientes/consultar-cuentas-corrientes.component";
import {RegistrarCuentaCorrienteComponent} from "./modules/clientes/registrar-cuenta-corriente/registrar-cuenta-corriente.component";
import { ConsultarInventarioComponent } from './modules/inventario/consultar-inventario/consultar-inventario.component';
import { BuscarProductosComponent } from './modules/productos/buscar-productos/buscar-productos.component';
import { RegistrarInventarioComponent } from './modules/inventario/registrar-inventario/registrar-inventario.component';
import { ConsultarTarjetasComponent } from './modules/tarjetas/consultar-tarjetas/consultar-tarjetas.component';
import { RegistrarTarjetaComponent } from './modules/tarjetas/registrar-tarjeta/registrar-tarjeta.component';
import { ConsultarVentasComponent } from './modules/venta/consultar-ventas/consultar-ventas.component';
import { DetalleVentaComponent } from './modules/venta/detalle-venta/detalle-venta.component';
import { VisualizacionesComponent } from './modules/Estadisticas/visualizaciones/visualizaciones.component';
import { VisualizacionesVentasComponent } from './modules/Estadisticas/visualizaciones-ventas/visualizaciones-ventas.component';
import { VisualizacionesComprasComponent } from './modules/Estadisticas/visualizaciones-compras/visualizaciones-compras.component';
import { SolicitarLicenciaComponent } from './modules/empleados/solicitar-licencia/solicitar-licencia.component';
import { RegistrarLicenciaComponent } from './modules/empleados/registrar-licencia/registrar-licencia.component';
import { ConsultarArqueoCajaComponent } from './modules/gerencia/consultar-arqueo-caja/consultar-arqueo-caja.component';
import { ConsultarCajaComponent } from './modules/gerencia/consultar-caja/consultar-caja.component';
import { RegistrarCajaComponent } from './modules/gerencia/registrar-caja/registrar-caja.component';
import { RegistrarArqueoCajaComponent } from './modules/gerencia/registrar-arqueo-caja/registrar-arqueo-caja.component';
import { DetalleArqueoComponent } from './modules/gerencia/detalle-arqueo/detalle-arqueo.component';
import {ErrorMessagesComponent} from "./core/errors/error-messages.component";
import {MatPaginatorModule} from "@angular/material/paginator";
import { VentasDiaComponent } from './modules/home/ventas-dia/ventas-dia.component';
import { VentasMensualesComponent } from './modules/home/ventas-mensuales/ventas-mensuales.component';
import { BaseChartDirective } from 'ng2-charts';
import { UltimosMovimientosComponent } from './modules/home/ultimos-movimientos/ultimos-movimientos.component';
import { ProductosStockLimitadoComponent } from './modules/home/productos-stock-limitado/productos-stock-limitado.component';
import { AsistenciasEmpleadosComponent } from './modules/home/asistencias-empleados/asistencias-empleados.component';
import { UltimosClientesRegistradosComponent } from './modules/home/ultimos-clientes-registrados/ultimos-clientes-registrados.component';
import { OrdenesDeCompraComponent } from './modules/home/ordenes-de-compra/ordenes-de-compra.component';
import { RecuperarContrasenaComponent } from './modules/auth/recuperar-contrasena/recuperar-contrasena.component';
import { AsignarCuentaCorrienteComponent } from './modules/clientes/asignar-cuenta-corriente/asignar-cuenta-corriente.component';
import { GenerarReportesComponent } from './modules/reportes/generar-reportes/generar-reportes.component';
import { QRVentanaComponent } from './modules/qr-ventana/qr-ventana.component';
import {SharedModule} from "./shared/shared.module";
import { PagarCuentaCorrienteComponent } from './modules/clientes/pagar-cuenta-corriente/pagar-cuenta-corriente.component';
registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    HomeComponent,
    ConsultarEmpleadosComponent,
    RegistrarEmpleadosComponent,
    ConsultarProductosComponent,
    ConsultarProveedoresComponent,
    RegistrarProveedorComponent,
    ConsultarPromocionesComponent,
    RegistrarPromocionComponent,
    NotificarPromocionComponent,
    MessagesComponent,
    ConsultarProductosComponent,
    RegistrarProductoComponent,
    ConsultarConfiguracionesComponent,
    MarcarAsistenciaComponent,
    ConsultarAsistenciaComponent,
    RegistrarAsistenciaComponent,
    RegistrarVentaComponent,
    RegistrarPedidoComponent,
    ConsultarPedidosComponent,
    RegistrarComprobanteComponent,
    ConsultarComprobanteComponent,
    ConsultarCuentasCorrientesComponent,
    RegistrarCuentaCorrienteComponent,
    RegistrarClientesComponent,
    ConsultarClientesComponent,
    ConsultarInventarioComponent,
    RegistrarInventarioComponent,
    BuscarProductosComponent,
    ConsultarTarjetasComponent,
    RegistrarTarjetaComponent,
    ConsultarVentasComponent,
    DetalleVentaComponent,
    VisualizacionesComponent,
    VisualizacionesVentasComponent,
    VisualizacionesComprasComponent,
    SolicitarLicenciaComponent,
    RegistrarLicenciaComponent,
    ConsultarArqueoCajaComponent,
    ConsultarCajaComponent,
    RegistrarCajaComponent,
    RegistrarArqueoCajaComponent,
    DetalleArqueoComponent,
    ErrorMessagesComponent,
    VentasDiaComponent,
    VentasMensualesComponent,
    UltimosMovimientosComponent,
    ProductosStockLimitadoComponent,
    AsistenciasEmpleadosComponent,
    UltimosClientesRegistradosComponent,
    OrdenesDeCompraComponent,
    ErrorMessagesComponent,
    RecuperarContrasenaComponent,
    RecuperarContrasenaComponent,
    GenerarReportesComponent,
    AsignarCuentaCorrienteComponent,
    QRVentanaComponent,
    PagarCuentaCorrienteComponent
  ],
  imports: [
    BrowserModule,
    MatTableModule,
    MatSortModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogClose,
    PickerComponent,
    NgxMaskDirective,
    NgxMaskPipe,
    FormsModule,
    MatPaginatorModule,
    BaseChartDirective,
    MatPaginatorModule,
    MatDialogContent,
    MatDialogActions,
    SharedModule
  ],
  providers: [
    HealthService,
    UsuariosService,
    AuthService,
    provideAnimationsAsync(),
    provideNgxMask(),
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true
    },
    { provide: LOCALE_ID, useValue: 'es' },
  ],
  bootstrap: [AppComponent],
  exports: [ErrorMessagesComponent]
})
export class AppModule { }
