import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HealthService} from "./services/health.service";
import { LoginComponent } from './modules/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { HeaderComponent } from './core/header/header.component';
import {MaterialModule} from "./shared/material-module";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { HomeComponent } from './modules/home/home.component';
import {ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {UsuariosService} from "./services/usuarios.service";
import {AuthService} from "./services/auth.servicie";
import { ConsultarEmpleadosComponent } from './modules/empleados/consultar-empleados/consultar-empleados.component';
import { RegistrarEmpleadosComponent } from './modules/empleados/registrar-empleados/registrar-empleados.component';
import { ConsultarProveedoresComponent } from './modules/proveedores/consultar-proveedores/consultar-proveedores.component';
import { RegistrarProveedorComponent } from './modules/proveedores/registrar-proveedor/registrar-proveedor.component';
import { ConsultarPromocionesComponent } from './modules/promociones/consultar-promociones/consultar-promociones.component';
import { RegistrarPromocionComponent } from './modules/promociones/registrar-promocion/registrar-promocion.component';
import { DetallePromocionComponent } from './modules/promociones/detalle-promocion/detalle-promocion.component';
import { NotificarPromocionComponent } from './modules/promociones/notificar-promocion/notificar-promocion.component';
import {PickerComponent} from "@ctrl/ngx-emoji-mart";
import { ConsultarConfiguracionesComponent } from './modules/configuraciones/consultar-configuraciones/consultar-configuraciones.component';
import { ConsultarProductosComponent } from './modules/productos/consultar-productos/consultar-productos.component';
import { RegistrarProductoComponent } from './modules/productos/registrar-producto/registrar-producto.component';
import { MessagesComponent } from './shared/messages/messages.component';
import {MatDialogClose} from "@angular/material/dialog";
import {DetalleEmpleadosComponent} from "./modules/empleados/detalle-empleados/detalle-empleados.component";
import {NgxMaskDirective, NgxMaskPipe, provideNgxMask} from "ngx-mask";
import {AuthInterceptor} from "./interceptors/auth.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    HomeComponent,
    ConsultarEmpleadosComponent,
    DetalleEmpleadosComponent,
    RegistrarEmpleadosComponent,
    ConsultarProductosComponent,
    ConsultarProveedoresComponent,
    RegistrarProveedorComponent,
    ConsultarPromocionesComponent,
    RegistrarPromocionComponent,
    DetallePromocionComponent,
    NotificarPromocionComponent,
    MessagesComponent,
    ConsultarProductosComponent,
    RegistrarProductoComponent,
    ConsultarConfiguracionesComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MaterialModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatDialogClose,
        PickerComponent,
        NgxMaskDirective,
        NgxMaskPipe
    ],
  providers: [
    HealthService,
    UsuariosService,
    AuthService,
    provideAnimationsAsync(),
    provideNgxMask(),
    {
      provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
