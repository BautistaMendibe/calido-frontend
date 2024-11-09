import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {NotificationService} from "../../../services/notificacion.service";
import {UsuariosService} from "../../../services/usuarios.service";
import {Asistencia} from "../../../models/asistencia";
import {FiltrosAsistencias} from "../../../models/comandos/FiltrosAsistencias.comando";
import {SolicitarLicenciaComponent} from "../solicitar-licencia/solicitar-licencia.component";
import {FiltrosLicencias} from "../../../models/comandos/FiltrosLicencias.comando";
import {Licencia} from "../../../models/licencia.model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-marcar-asistencia',
  templateUrl: './marcar-asistencia.component.html',
  styleUrl: './marcar-asistencia.component.scss'
})
export class MarcarAsistenciaComponent implements OnInit {
  @ViewChild('dialogoComentario') dialogoComentario!: TemplateRef<any>;
  dialogoComentarioRef!: MatDialogRef<any>;

  public nombreApellido: string = '';
  public idUsuario: number = -1;
  public diasDelMes: any[] = [];
  public columnas = ['nombreApellido', 'fecha', 'horaEntrada', 'horaSalida', 'comentario', 'acciones'];
  public columnasLicencias = ['nombreApellido', 'periodo', 'motivo', 'estado', 'comentario', 'acciones'];
  public fechaHoy = new Date();
  public horaEntrada: string = '';
  public horaSalida: string = '';
  public presente: boolean = false;
  public salida: boolean = false;
  public botonPresenteDeshabilitado: boolean = false;
  public botonSalidaDeshabilitado: boolean = false;
  public botonLicenciaDeshabilitado: boolean = false;
  public asistencias: any[] = [];
  public licencias: Licencia[] = [];
  public isSearchingAsistencias = true;
  public isSearchingLicencias = true;
  public asistencia = new Asistencia();
  public form: FormGroup;
  public comentario: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public tableDataSourceAsistencia: MatTableDataSource<Asistencia> = new MatTableDataSource<Asistencia>([]);
  public tableDataSourceLicencia: MatTableDataSource<Licencia> = new MatTableDataSource<Licencia>([]);

  constructor(
    private router: Router,
    private notificacionService: SnackBarService,
    private authService: AuthService,
    private notificationDialogService: NotificationService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private usuariosService: UsuariosService
  ) {
    this.form = this.fb.group({
      txComentario: ['', [Validators.maxLength(200)]]
    });
  }

  ngOnInit() {
    this.authService.authenticationStatus$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        const token = this.authService.getToken();
        const infoToken: any = this.authService.getDecodedAccessToken(token);
        const idUsuario = infoToken.idusuario;
        const nombre = infoToken.nombre;
        const apellido = infoToken.apellido;
        this.nombreApellido = `${nombre} ${apellido}`;
        this.idUsuario = idUsuario;
      }
    });

    this.generarDiasDelMes();
    this.consultarAsistencias();
    this.consultarLicencias();
  }

  consultarAsistencias(): void {
    this.usuariosService.consultarAsistencias(new FiltrosAsistencias()).subscribe({
      next: (asistencias) => {

        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1;
        const anioActual = fechaActual.getFullYear()

        this.asistencias = asistencias.filter(asistencia => {
          const fechaAsistencia = new Date(asistencia.fecha);
          const mesAsistencia = fechaAsistencia.getMonth() + 1;
          const anioAsistencia = fechaAsistencia.getFullYear();

          return asistencia.idUsuario === this.idUsuario &&
            mesAsistencia === mesActual &&
            anioAsistencia === anioActual;
        });
        this.tableDataSourceAsistencia.data = this.asistencias;
        this.tableDataSourceAsistencia.paginator = this.paginator;
        this.tableDataSourceAsistencia.sort = this.sort;

        this.isSearchingAsistencias = false;
        this.verificarAsistencias();
      },
      error: (err) => {
        this.notificacionService.openSnackBarError('Error al cargar asistencias. Intente nuevamente.');
      }
    });
  }

  consultarLicencias(): void {
    this.usuariosService.consultarLicencias(new FiltrosLicencias()).subscribe({
      next: (licencias) => {
        const fechaActual = new Date();
        const anioActual = fechaActual.getFullYear();

        this.licencias = licencias.filter(licencia => {
          const fechaLicencia = new Date(licencia.fechaInicio);
          const anioLicencia = fechaLicencia.getFullYear();

          return licencia.idUsuario === this.idUsuario &&
            anioLicencia === anioActual; // Filtrar solo por año
        });
        this.tableDataSourceLicencia.data = this.licencias;
        this.tableDataSourceLicencia.paginator = this.paginator;
        this.tableDataSourceLicencia.sort = this.sort;

        this.isSearchingLicencias = false;
      },
      error: (err) => {
        this.notificacionService.openSnackBarError('Error al cargar licencias. Intente nuevamente.');
      }
    });
  }

  eliminarLicencia(idLicencia: number): void {
    this.notificationDialogService.confirmation(
      '¿Desea eliminar la licencia?', 'Eliminar Licencia')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarLicencia(idLicencia).subscribe({
            next: (respuesta) => {
              if (respuesta.mensaje === 'OK') {
                this.notificacionService.openSnackBarSuccess('Licencia eliminada con éxito');
                this.consultarLicencias();
              } else {
                this.notificacionService.openSnackBarError('Error al eliminar la licencia.');
              }
            },
            error: () => {
              this.notificacionService.openSnackBarError('Error al eliminar la licencia.');
            }
          });
        }
      });
  }

  buscarAsistenciaHoy(): Asistencia {
    const fechaHoy = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const idUsuario = this.idUsuario;

    // Buscar la asistencia para hoy del usuario
    return this.asistencias.find(
      asistencia =>
        asistencia.idUsuario === idUsuario &&
        asistencia.fecha?.startsWith(fechaHoy)
    )
  }

  /**
   * Verifica si el usuario ya marcó su asistencia para hoy
   */
  verificarAsistencias(): void {
    const asistenciaHoy = this.buscarAsistenciaHoy();

    if (asistenciaHoy) {
      // Verificar si hay hora de entrada, si la hay es porque ya marcó presente antes.
      if (asistenciaHoy.horaEntrada) {
        this.presente = true;
        this.botonPresenteDeshabilitado = true;
        this.horaEntrada = asistenciaHoy.horaEntrada;
      } else {
        this.presente = false;
        this.botonPresenteDeshabilitado = false;
      }

      // Verificar si hay hora de salida, si la hay es porque ya marcó su presente y salida antes.
      if (asistenciaHoy.horaSalida) {
        this.salida = true;
        this.botonPresenteDeshabilitado = true;
        this.botonSalidaDeshabilitado = true;
        this.horaSalida = asistenciaHoy.horaSalida;
      } else {
        this.salida = false;
        this.botonSalidaDeshabilitado = false;
      }
    } else {
      // Si no hay asistencia para hoy, deshabilitar el botón de salida y poner presente en false
      this.presente = false;
      this.botonPresenteDeshabilitado = false;
      this.salida = false;
      this.botonSalidaDeshabilitado = true;
    }
  }

  generarDiasDelMes(): void {
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const ultimoDia = new Date(year, month + 1, 0).getDate();

    for (let dia = 1; dia <= ultimoDia; dia++) {
      this.diasDelMes.push({
        fecha: new Date(year, month, dia),
        seleccionado: false,
        comentario: ''
      });
    }
  }

  marcarPresente(): void {
    this.notificationDialogService.confirmation(
      `¿Desea marcar la entrada?
    Esta acción no es reversible.`, 'Marcar Entrada'
    ).afterClosed().subscribe((value) => {
      if (value) {
        if (!this.botonPresenteDeshabilitado) {

          // Obtener la fecha actual
          const fechaActual = new Date();
          const fechaEntrada = new Date(fechaActual.toISOString().split('T')[0]); // Solo la parte de la fecha, sin la hora

          // Validación de superposición con licencias
          const existeSuperposicionLicencia = this.licencias.some((licenciaExistente: Licencia) => {
            const fechaInicioExistente = new Date(licenciaExistente.fechaInicio);
            const fechaFinExistente = new Date(licenciaExistente.fechaFin);

            // Comprobar si la fecha de entrada coincide con las fechas de la licencia (incluidos los extremos)
            return (
              (fechaEntrada >= fechaInicioExistente && fechaEntrada <= fechaFinExistente)
            );
          });

          if (existeSuperposicionLicencia) {
            this.notificacionService.openSnackBarError('No puede marcar presencia en días que tiene licencia.');
            return; // No continuar si hay superposición con licencias
          }

          this.asistencia.fecha = fechaActual;
          this.asistencia.horaEntrada = fechaActual.toLocaleTimeString('en-GB', { hour12: false });
          this.asistencia.idUsuario = this.idUsuario;

          this.usuariosService.registrarAsistencia(this.asistencia).subscribe({
            next: (respuesta) => {
              if (respuesta.mensaje === 'OK') {
                this.notificacionService.openSnackBarSuccess('La entrada se registró con éxito');
                this.presente = true;
                this.botonPresenteDeshabilitado = true;
                this.botonSalidaDeshabilitado = false;
                this.consultarAsistencias();
              } else {
                this.notificacionService.openSnackBarError('Error al registrar la entrada. Intente nuevamente');
              }
            },
            error: (err) => {
              this.notificacionService.openSnackBarError('Error al registrar la entrada. Inténtelo nuevamente');
            }
          });
        }
      }
    });
  }

  marcarSalida(): void {
    this.notificationDialogService.confirmation(
      `¿Desea marcar la salida?
      Esta acción no es reversible.`, 'Marcar Salida')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          if (!this.botonSalidaDeshabilitado) {

            const asistenciaHoy = this.buscarAsistenciaHoy();
            asistenciaHoy.horaSalida = new Date().toLocaleTimeString('en-GB', { hour12: false });

            this.usuariosService.modificarAsistencia(asistenciaHoy).subscribe({
              next: (respuesta) => {
                if (respuesta.mensaje === 'OK') {
                  this.notificacionService.openSnackBarSuccess('La salida se registró con éxito');
                  this.salida = true;
                  this.botonPresenteDeshabilitado = true;
                  this.botonSalidaDeshabilitado = true;
                  this.consultarAsistencias();
                } else {
                  this.notificacionService.openSnackBarError('Error al registrar la salida. Intente nuevamente');
                }
              },
              error: (err) => {
                this.notificacionService.openSnackBarError('Error al registrar la salida. Inténtelo nuevamente');
              }
            });
            }
          }
      });
  }

  public marcarLicencia() {
    this.dialog.open(
      SolicitarLicenciaComponent,
      {
        width: '50vh',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          referencia: this,
        }
      }
    )
  }

  abrirDialogComentario(presencia: Asistencia | Licencia): void {
    this.txComentario.setValue(presencia.comentario);

    this.dialogoComentarioRef = this.dialog.open(this.dialogoComentario, {
      width: '75%',
      autoFocus: false,
      data: { presencia }
    });
  }

  guardarComentario(): void {
    const data = this.dialogoComentarioRef._containerInstance._config.data;

    if (data?.presencia && data?.presencia.horaEntrada) {
      this.guardarComentarioAsistencia(data.presencia as Asistencia);
    } else {
      this.guardarComentarioLicencia(data.presencia as Licencia);
    }

    this.txComentario.reset();
  }

  guardarComentarioAsistencia(asistencia: Asistencia): void {
    if (this.form.valid) {
      asistencia.comentario = this.txComentario.value;

      this.usuariosService.modificarAsistencia(asistencia).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje === 'OK') {
            this.notificacionService.openSnackBarSuccess('Asistencia modificada con éxito');
            this.consultarAsistencias();
            this.dialogoComentarioRef.close();
          } else {
            this.notificacionService.openSnackBarError('Error al modificar la asistencia');
            this.dialogoComentarioRef.close();
          }
        },
        error: () => {
          this.notificacionService.openSnackBarError('Error al modificar la asistencia');
          this.dialogoComentarioRef.close();
        }
      });
    }
  }

  guardarComentarioLicencia(licencia: Licencia): void {
    if (this.form.valid) {
      licencia.comentario = this.txComentario.value;

      this.usuariosService.modificarLicencia(licencia).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje === 'OK') {
            this.notificacionService.openSnackBarSuccess('Licencia modificada con éxito');
            this.consultarLicencias();
            this.dialogoComentarioRef.close();
          } else {
            this.notificacionService.openSnackBarError('Error al modificar la licencia');
            this.dialogoComentarioRef.close();
          }
        },
          error: () => {
            this.notificacionService.openSnackBarError('Error al modificar la licencia');
            this.dialogoComentarioRef.close();
          }
        });
    }
  }

  get txComentario(): FormControl {
    return this.form.get('txComentario') as FormControl;
  }
}
