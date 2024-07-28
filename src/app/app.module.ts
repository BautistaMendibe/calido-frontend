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
import {HttpClientModule} from "@angular/common/http";
import {UsuariosService} from "./services/usuarios.service";
import {AuthService} from "./services/auth.servicie";
import { ConsultarEmpleadosComponent } from './modules/empleados/consultar-empleados/consultar-empleados.component';
import { RegistrarEmpleadosComponent } from './modules/empleados/registrar-empleados/registrar-empleados.component';
import { ConsultarProveedoresComponent } from './modules/proveedores/consultar-proveedores/consultar-proveedores.component';
import { RegistrarProveedorComponent } from './modules/proveedores/registrar-proveedor/registrar-proveedor.component';
import { MessagesComponent } from './shared/messages/messages.component';
import {MatDialogClose} from "@angular/material/dialog";

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
    ConsultarProveedoresComponent,
    RegistrarProveedorComponent,
    MessagesComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MaterialModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatDialogClose
    ],
  providers: [
    HealthService,
    UsuariosService,
    AuthService,
    provideAnimationsAsync()],
  bootstrap: [AppComponent]
})
export class AppModule { }
