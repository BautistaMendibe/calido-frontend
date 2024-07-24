import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./modules/login/login.component";
import {HomeComponent} from "./modules/home/home.component";
import {ConsultarEmpleadosComponent} from "./modules/empleados/consultar-empleados/consultar-empleados.component";
import {
  ConsultarProveedoresComponent
} from "./modules/proveedores/consultar-proveedores/consultar-proveedores.component";
import {
  ConsultarPromocionesComponent
} from "./modules/promociones/consultar-promociones/consultar-promociones.component";
import {NotificarPromocionComponent} from "./modules/promociones/notificar-promocion/notificar-promocion.component";

const routes: Routes = [
  {path:'', component: HomeComponent},
  {path:'login', component: LoginComponent},
  {path:'consultar-empleados', component: ConsultarEmpleadosComponent},
  {path:'consultar-proveedores', component: ConsultarProveedoresComponent},
  {path:'consultar-promociones', component: ConsultarPromocionesComponent},
  {path:'notificar-promocion', component: NotificarPromocionComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
