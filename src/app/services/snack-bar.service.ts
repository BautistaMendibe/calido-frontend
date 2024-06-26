import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  constructor(private snackBar: MatSnackBar) {}

  public openSnackBarError(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      verticalPosition: 'top',
      panelClass: 'notify-error'
    });
  }

  public openSnackBarSuccess(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 25000,
      verticalPosition: 'top',
      panelClass: 'notify-success'
    });
  }
}
