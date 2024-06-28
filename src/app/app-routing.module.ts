import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./modules/login/login.component";
import {HomeComponent} from "./modules/home/home.component";
import {ConsultarEmpleadosComponent} from "./modules/empleados/consultar-empleados/consultar-empleados.component";

const routes: Routes = [
  {path:'', component: HomeComponent},
  {path:'login', component: LoginComponent},
  {path:'consultar-empleados', component: ConsultarEmpleadosComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
