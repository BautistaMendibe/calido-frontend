import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {CajasService} from "../../../services/cajas.service";
import {takeUntil} from "rxjs/operators";
import {Arqueo} from "../../../models/Arqueo.model";
import {RegistrarArqueoCajaComponent} from "../registrar-arqueo-caja/registrar-arqueo-caja.component";
import {FiltrosArqueos} from "../../../models/comandos/FiltrosArqueos.comando";
import {EstadoArqueo} from "../../../models/estadoArqueo.model";
import {Router} from "@angular/router";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-consultar-arqueo-caja',
  templateUrl: './consultar-arqueo-caja.component.html',
  styleUrl: './consultar-arqueo-caja.component.scss'
})
export class ConsultarArqueoCajaComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Arqueo> = new MatTableDataSource<Arqueo>([]);
  public form: FormGroup;
  public arqueos: Arqueo[] = [];
  public listaEstadosArqueo: EstadoArqueo[] = [];
  public columnas: string[] = ['caja', 'fechaApertura', 'horaApertura', 'horaCierre', 'diferencia', 'estado', 'acciones'];
  private filtros: FiltrosArqueos;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    private router: Router,
    private cajasService: CajasService) {
    this.form = this.fb.group({
      txFechaApertura: [''],
      txEstado: [''],
    });
    this.filtros = new FiltrosArqueos();
  }

  ngOnInit() {
    this.createForm();
    this.buscarEstadosArqueo();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txFechaApertura: [''],
      txEstado: [''],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros = {
      fechaApertura: this.txFechaApertura.value,
      estado: this.txEstado.value,
    };

    this.isLoading = true;
    this.cajasService.consultarArqueos(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (arqueos) => {
          this.arqueos = arqueos;
          this.tableDataSource.data = this.arqueos;
          this.tableDataSource.paginator = this.paginator;
          this.tableDataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
        }
      });
  }

  public buscarEstadosArqueo() {
    this.cajasService.obtenerEstadosArqueo()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (estados) => {
          this.listaEstadosArqueo = estados;
        },
        error: (err) => {
        }
      });
  }

  public registrarNuevoArqueo() {
    this.dialog.open(
      RegistrarArqueoCajaComponent,
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

  public verArqueo(arqueo: Arqueo, editar: boolean) {
    this.dialog.open(
      RegistrarArqueoCajaComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        autoFocus: false,
        data: {
          arqueo: arqueo,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar,
        }
      }
    );
  }

  public verDetalleArqueo(idArqueo: number) {
    this.router.navigate(['/detalle-arqueo', idArqueo])
  }

  public eliminarArqueo(idArqueo: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el arqueo?', 'Eliminar Arqueo')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.cajasService.eliminarArqueo(idArqueo).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Arqueo eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar arqueo');
            }
          });
        }
      });
  }

  // Región getters
  get txFechaApertura(): FormControl {
    return this.form.get('txFechaApertura') as FormControl;
  }

  get txEstado(): FormControl {
    return this.form.get('txEstado') as FormControl;
  }
}
