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

@Component({
  selector: 'app-consultar-asistencia',
  templateUrl: './consultar-asistencia.component.html',
  styleUrl: './consultar-asistencia.component.scss'
})
export class ConsultarAsistenciaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public tableDataSource: MatTableDataSource<Asistencia> = new MatTableDataSource<Asistencia>([]);
  public form: FormGroup;
  // Ver. Crear tabla empleados que cada uno tenga un usuario
  public asistencias: Asistencia[] = [];
  public columnas = ['nombre', 'fecha', 'horaEntrada', 'horaSalida', 'comentario', 'acciones'];

  private filtros: FiltrosAsistencias;
  public listaEmpleados: Usuario[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosAsistencias();
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
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
    this.usuariosService.consultarUsuarios(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaEmpleados = usuarios;
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.idUsuario = this.txNombreUsuario.value || null;
    this.filtros.fecha = this.txFecha.value || null;

    this.usuariosService.consultarAsistencias(this.filtros).subscribe((asistencias) => {
      this.asistencias = asistencias;
      this.tableDataSource.data = asistencias;
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


  // Getters
  get txNombreUsuario(): FormControl {
    return this.form.get('txNombreUsuario') as FormControl;
  }

  get txFecha(): FormControl {
    return this.form.get('txFecha') as FormControl;
  }

}
