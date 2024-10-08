import {Component, OnInit, Inject} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FiltrosCuentasCorrientes} from "../../../models/comandos/FiltrosCuentasCorrientes";
import {Subject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {takeUntil} from "rxjs/operators";
import {Venta} from "../../../models/venta.model";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import { ConsultarCuentasCorrientesComponent } from '../consultar-cuentas-corrientes/consultar-cuentas-corrientes.component';
import { VentasService } from '../../../services/ventas.services';
import { MAT_DIALOG_DATA} from "@angular/material/dialog";


@Component({
  selector: 'app-ventas-por-cuenta-corriente',
  templateUrl: './ventas-por-cuenta-corriente.component.html',
  styleUrl: './ventas-por-cuenta-corriente.component.scss'
})
export class VentasPorCuentaCorrienteComponent {
  public form: FormGroup;
  private referencia: ConsultarCuentasCorrientesComponent;
  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);

  public ventas: Venta[] = [];
  public columnas: string[] = ['idCuenta','nombre', 'apellido','creada','balance','acciones'];
  private filtros: FiltrosCuentasCorrientes;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public displayedColumns: string[] = ['idVenta', 'fechaVenta', 'montototal', 'expand'];
  public productColumns: string[] = ['imgproducto','idProducto', 'nProducto', 'cantidad', 'subtotalventa'];

    // Variable para rastrear qué fila está expandida
  public expandedElement: any | null;
  public idUsuario:number;


  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    private VentasService: VentasService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarCuentasCorrientesComponent;
      cuentaCorriente: CuentaCorriente;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.idUsuario = this.data.cuentaCorriente.idUsuario;
    this.filtros = new FiltrosCuentasCorrientes();
  }

  ngOnInit() {
    this.createForm();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txFechaDesde: [''],
      txFechaHasta:['']
    });
  }

  public limpiarFiltros() {
    this.form.reset();
  }

  public buscar() {
    this.filtros = {
      fechaDesde: this.txFechaDesde.value,
      fechaHasta: this.txFechaHasta.value,
      idUsuario: this.idUsuario
      
    };
    console.log(this.filtros);

    this.VentasService.buscarVentasPorCC(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (ventas) => {
          this.ventas = ventas;
          this.tableDataSource.data= ventas;
          console.log(ventas);
      
        },
        error: (err) => {
          
          console.error('Error al consultar ventas por cuenta corriente:', err);
        }
      });
  }

  toggleRow(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  get txFechaDesde(): FormControl {
    return this.form.get('txFechaDesde') as FormControl;
  }

  get txFechaHasta(): FormControl {
    return this.form.get('txFechaHasta') as FormControl;
  }

}
