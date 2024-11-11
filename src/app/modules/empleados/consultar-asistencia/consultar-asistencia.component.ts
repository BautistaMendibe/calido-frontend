import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Usuario} from "../../../models/usuario.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {Asistencia} from "../../../models/asistencia";
import {FiltrosAsistencias} from "../../../models/comandos/FiltrosAsistencias.comando";
import {RegistrarAsistenciaComponent} from "../registrar-asistencia/registrar-asistencia.component";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {Licencia} from "../../../models/licencia.model";
import {FiltrosLicencias} from "../../../models/comandos/FiltrosLicencias.comando";
import {RegistrarLicenciaComponent} from "../registrar-licencia/registrar-licencia.component";

@Component({
  selector: 'app-consultar-asistencia',
  templateUrl: './consultar-asistencia.component.html',
  styleUrl: './consultar-asistencia.component.scss'
})
export class ConsultarAsistenciaComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Asistencia> = new MatTableDataSource<Asistencia>([]);
  public tableDataSourceLicencia: MatTableDataSource<Licencia> = new MatTableDataSource<Licencia>([]);
  public form: FormGroup;

  public asistencias: Asistencia[] = [];
  public licencias: Licencia[] = [];
  public columnas = ['nombre', 'fecha', 'horaEntrada', 'horaSalida', 'comentario', 'acciones'];
  public columnasLicencias = ['nombre', 'periodo', 'motivo', 'estado', 'comentario', 'acciones'];

  private filtrosAsistencias: FiltrosAsistencias;
  private filtrosLicencias: FiltrosLicencias;
  public listaEmpleados: Usuario[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Banderas
  public isSearchingAsistencias: boolean = false;
  public isSearchingLicencias: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtrosAsistencias = new FiltrosAsistencias();
    this.filtrosLicencias = new FiltrosLicencias();
  }

  ngOnInit() {
    this.buscarEmpleados();
    this.crearFormulario();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombreUsuario: ['', []],
      txFecha: ['', []]
    });
  }

  private buscarEmpleados(){
    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaEmpleados = usuarios;
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtrosAsistencias.idUsuario = this.txNombreUsuario.value || null;
    this.filtrosAsistencias.fecha = this.txFecha.value || null;
    this.isSearchingAsistencias = true;

    this.filtrosLicencias.idUsuario = this.txNombreUsuario.value || null;
    this.filtrosLicencias.fecha = this.txFecha.value || null;
    this.isSearchingLicencias = true;

    this.usuariosService.consultarAsistencias(this.filtrosAsistencias).subscribe((asistencias) => {
      this.asistencias = asistencias;
      this.tableDataSource.data = this.asistencias;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      this.isSearchingAsistencias = false;
    });

    this.usuariosService.consultarLicencias(this.filtrosLicencias).subscribe((licencias) => {
      this.licencias = licencias;
      this.tableDataSourceLicencia.data = this.licencias;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      this.isSearchingLicencias = false;
    });
  }

  public registrarNuevaAsistencia() {
    this.dialog.open(
      RegistrarAsistenciaComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    )
  }

  public verAsistencia(asistencia: Asistencia, editar: boolean) {
    this.dialog.open(
      RegistrarAsistenciaComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        data: {
          asistencia: asistencia,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    )
  }

  public registrarNuevaLicencia() {
    this.dialog.open(
      RegistrarLicenciaComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    )
  }

  public verLicencia(licencia: Licencia, editar: boolean) {
    this.dialog.open(
      RegistrarLicenciaComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        data: {
          licencia: licencia,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    )
  }

  public eliminarAsistencia(idAsistencia: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar la asistencia?', 'Eliminar Asistencia')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarAsistencia(idAsistencia).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Asistencia eliminada con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar la asistencia');
            }
          });
        }
      });
  }

  public eliminarLicencia(idLicencia: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar la licencia?', 'Eliminar Licencia')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarLicencia(idLicencia).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Licencia eliminada con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar la licencia');
            }
          });
        }
      });
  }


  // Getters
  get txNombreUsuario(): FormControl {
    return this.form.get('txNombreUsuario') as FormControl;
  }

  get txFecha(): FormControl {
    return this.form.get('txFecha') as FormControl;
  }

}
