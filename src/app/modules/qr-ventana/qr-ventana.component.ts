import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-qr-ventana',
  templateUrl: './qr-ventana.component.html',
  styleUrl: './qr-ventana.component.scss'
})
export class QRVentanaComponent {
  constructor(
    public dialogRef: MatDialogRef<QRVentanaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
