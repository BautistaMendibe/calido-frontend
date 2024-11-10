import {Component, Inject, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {CajasService} from "../../../services/cajas.service";
import {VentasService} from "../../../services/ventas.services";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-detalle-arqueo',
  templateUrl: './detalle-arqueo.component.html',
  styleUrl: './detalle-arqueo.component.scss'
})
export class DetalleArqueoComponent implements OnInit {
  public form: FormGroup;
  public idArqueo: string | null = null;

  detalleEfectivo: boolean = false;
  detalleTarjeta: boolean = false;
  detalleMercadoPago: boolean = false;
  detalleEgreso: boolean = false;

  ventas = [
    { fecha: '10/11/2024', descripcion: 'Venta de producto', formaPago: 'Efectivo', importe: 1000.00 },
    { fecha: '10/11/2024', descripcion: 'Venta de producto', formaPago: 'Tarjeta', importe: 800.00 },
    // Agrega más datos de ejemplo si es necesario
  ];

  // Configuración de la fuente de datos para la tabla
  dataSource = new MatTableDataSource(this.ventas);

  // Columnas de la tabla
  displayedColumns: string[] = ['fecha', 'descripcion', 'formaPago', 'importe'];

  constructor(
    private fb: FormBuilder,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private cajasService: CajasService,
    private ventasService: VentasService,
    private route: ActivatedRoute,
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idArqueo = params.get('id');
      // TODO: Buscar ventas por id de arqueo
    });
  }

  toggleDetalle(tipo: string): void {
    switch (tipo) {
      case 'efectivo':
        this.detalleEfectivo = !this.detalleEfectivo;
        break;
      case 'tarjeta':
        this.detalleTarjeta = !this.detalleTarjeta;
        break;
      case 'mercadopago':
        this.detalleMercadoPago = !this.detalleMercadoPago;
        break;
      case 'egreso':
        this.detalleEgreso = !this.detalleEgreso;
        break;
    }
  }

  tipoMovimiento: string = '';
  descripcionMovimiento: string = '';
  importeMovimiento: number | null = null;

  // Método para añadir un movimiento manual
  agregarMovimiento(): void {
    if (this.tipoMovimiento && this.descripcionMovimiento && this.importeMovimiento !== null) {
      // Lógica para agregar el movimiento (e.g., guardarlo en el sistema o actualizar el estado)
      console.log('Movimiento añadido:', {
        tipo: this.tipoMovimiento,
        descripcion: this.descripcionMovimiento,
        importe: this.importeMovimiento
      });

      // Reinicia los campos
      this.tipoMovimiento = '';
      this.descripcionMovimiento = '';
      this.importeMovimiento = null;
    }
  }
}
