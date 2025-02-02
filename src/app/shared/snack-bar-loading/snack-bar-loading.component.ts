import {Component, Inject, Injectable} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from "@angular/material/snack-bar";

@Component({
  selector: 'app-snack-bar-loading',
  templateUrl: './snack-bar-loading.component.html',
  styleUrl: './snack-bar-loading.component.scss'
})
export class SnackBarLoadingComponent {

  public mensaje: string = '';

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: {mensaje: string}) {
    this.mensaje = data.mensaje;
  }

}
