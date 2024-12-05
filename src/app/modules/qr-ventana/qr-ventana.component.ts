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
  icono: string = 'hourglass_empty';

  idReferenciaOperacion: string = this.data.idReferenciaOperacion;  // Se asume que el ID de referencia se pasa en los datos del diálogo

  private estadoPagoInterval: any;

  private mapaEstados: { [key: string]: { texto: string; icono: string } } = {
    REGISTRADA: { texto: "PENDIENTE", icono: "hourglass_empty" },
    CANCELADA: { texto: "CANCELADO", icono: "cancel" },
    VENCIDA: { texto: "VENCIDO", icono: "timer_off" },
    PROCESADA: { texto: "PAGADO", icono: "check_circle" },
  };

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
    }, 5000);  // Cada 10 segundos (puedes cambiarlo según lo necesites)
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
          const estadoRecibido = ultimoEstado.Estado;

          // Mapeamos el estado recibido a un texto personalizado
          //console.log("estadoPago", this.estadoPago);
          //console.log("estadoRecibido", estadoRecibido);
          //console.log("obtenerTextoEstado", this.obtenerTextoEstado(estadoRecibido));

          this.estadoPago = this.obtenerTextoEstado(estadoRecibido);
          this.icono = this.obtenerIconoEstado(estadoRecibido);
        } else {
          this.estadoPago = "DESCONOCIDO. Consulte con soporte.";
          this.icono = "help";
        }
      },
      error: (error) => {
        console.error('Error al consultar el estado del pago:', error);
        this.estadoPago = "Error al consultar el estado del pago.";
      }
    });
  }

  obtenerTextoEstado(estado: string): string {
    return this.mapaEstados[estado]?.texto || "DESCONOCIDO. Consulte con soporte.";
  }

  obtenerIconoEstado(estado: string): string {
    return this.mapaEstados[estado]?.icono || "help"; // Ícono por defecto
  }

  closeDialog(): void {
    if (this.estadoPagoInterval) {
      clearInterval(this.estadoPagoInterval);
    }
    this.dialogRef.close();
  }
}
