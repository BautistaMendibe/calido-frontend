import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleDirective } from './directives/role.directive';
import { SnackBarLoadingComponent } from './snack-bar-loading/snack-bar-loading.component';

@NgModule({
  declarations: [
    RoleDirective,
    SnackBarLoadingComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RoleDirective
  ],
})
export class SharedModule { }
