import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {VentasService} from "../../services/ventas.services";

@Component({
  selector: 'app-qr-ventana',
  templateUrl: './qr-ventana.component.html',
  styleUrls: ['./qr-ventana.component.scss']
})
export class QRVentanaComponent implements OnInit, OnDestroy {
  estadoPago: string = 'Cargando...';
  idReferenciaOperacion: string = this.data.idReferenciaOperacion;  // Se asume que el ID de referencia se pasa en los datos del diálogo

  private estadoPagoInterval: any;

  constructor(
    public dialogRef: MatDialogRef<QRVentanaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string, idReferenciaOperacion: string },
    private ventasService: VentasService
  ) {}

  ngOnInit() {
    // Llamamos a la función de consulta de estado al inicio
    this.obtenerEstadoPago();

    // Realizamos la consulta periódica
    this.estadoPagoInterval = setInterval(() => {
      this.obtenerEstadoPago();
    }, 3000);  // Cada 10 segundos (puedes cambiarlo según lo necesites)
  }

  ngOnDestroy() {
    // Limpiamos el intervalo cuando el componente sea destruido
    if (this.estadoPagoInterval) {
      clearInterval(this.estadoPagoInterval);
    }
  }

  obtenerEstadoPago() {
    this.ventasService.consultaPagoSIROQR(this.idReferenciaOperacion).subscribe({
      next: (respuesta) => {
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          const ultimoEstado = respuesta[respuesta.length - 1];
          this.estadoPago = ultimoEstado.Estado;
        } else {
          this.estadoPago = "No se encontró información del pago.";
        }
      },
      error: (error) => {
        console.error('Error al consultar el estado del pago:', error);
        this.estadoPago = "Error al consultar el estado del pago.";
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
