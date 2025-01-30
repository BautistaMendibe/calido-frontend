import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {SnackBarLoadingComponent} from "../shared/snack-bar-loading/snack-bar-loading.component";

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  constructor(private snackBar: MatSnackBar) {}

  public openSnackBarError(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      verticalPosition: 'top',
      panelClass: 'notify-error',
      duration: 3000
    });
  }

  public openSnackBarSuccess(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 2000,
      verticalPosition: 'top',
      panelClass: 'notify-success'
    });
  }

  public openSnackBarLoading() {
    return this.snackBar.openFromComponent(SnackBarLoadingComponent, {
      verticalPosition: 'top',
      panelClass: 'notify-loading'
    });
  }
}
