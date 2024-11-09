import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {takeUntil} from "rxjs/operators";
import {Caja} from "../../../models/Caja.model";
import {FiltrosCajas} from "../../../models/comandos/FiltrosCaja.comando";
import {RegistrarCajaComponent} from "../registrar-caja/registrar-caja.component";
import {CajasService} from "../../../services/cajas.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-consultar-caja',
  templateUrl: './consultar-caja.component.html',
  styleUrl: './consultar-caja.component.scss'
})
export class ConsultarCajaComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Caja> = new MatTableDataSource<Caja>([]);
  public form: FormGroup;
  public cajas: Caja[] = [];
  public columnas: string[] = ['nombre', 'descripcion', 'acciones'];
  private filtros: FiltrosCajas;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    private cajasService: CajasService) {
    this.form = this.fb.group({
      txNombre: [''],
      txDescripcion: [''],
    });
    this.filtros = new FiltrosCajas();
  }

  ngOnInit() {
    this.createForm();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txNombre: [''],
      txDescripcion: [''],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros = {
      nombre: this.txNombre.value,
    };

    this.isLoading = true;
    this.cajasService.consultarCajas(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (cajas) => {
          this.cajas = cajas;
          this.tableDataSource.data = this.cajas;
          this.tableDataSource.paginator = this.paginator;
          this.tableDataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        }
      });
  }

  public registrarNuevaCaja() {
    this.dialog.open(
      RegistrarCajaComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false,
          esRegistro: true,
        }
      }
    );
  }

  public verCaja(caja: Caja, editar: boolean) {
    this.dialog.open(
      RegistrarCajaComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        autoFocus: false,
        data: {
          caja: caja,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar,
        }
      }
    );
  }

  public eliminarCaja(idCaja: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar la caja?', 'Eliminar Caja')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.cajasService.eliminarCaja(idCaja).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Caja eliminada con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar caja');
            }
          });
        }
      });
  }

  // Región getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txDescripcion(): FormControl {
    return this.form.get('txDescripcion') as FormControl;
  }
}
