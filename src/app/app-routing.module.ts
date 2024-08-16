import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./modules/login/login.component";
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
import {RegistrarVentaComponent} from "./modules/venta/registrar-venta/registrar-venta.component";

const routes: Routes = [
  {path:'', component: HomeComponent},
  {path:'login', component: LoginComponent},
  {path:'consultar-empleados', component: ConsultarEmpleadosComponent},
  {path:'consultar-proveedores', component: ConsultarProveedoresComponent},
  {path:'consultar-productos', component: ConsultarProductosComponent},
  {path:'consultar-proveedores', component: ConsultarProveedoresComponent},
  {path:'consultar-promociones', component: ConsultarPromocionesComponent},
  {path:'notificar-promocion', component: NotificarPromocionComponent},
  {path:'consultar-configuraciones', component: ConsultarConfiguracionesComponent},
  {path:'consultar-productos', component: ConsultarProductosComponent},
  {path:'registar-venta', component: RegistrarVentaComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
