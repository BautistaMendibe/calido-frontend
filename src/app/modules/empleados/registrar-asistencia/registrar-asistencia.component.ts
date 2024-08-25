import {Component, Inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {AuthService} from "../../../services/auth.servicie";
import {Router} from "@angular/router";
import {NotificationService} from "../../../services/notificacion.service";
import {UsuariosService} from "../../../services/usuarios.service";
import {Asistencia} from "../../../models/asistencia";

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.component.html',
  styleUrl: './registrar-asistencia.component.scss'
})
export class RegistrarAsistenciaComponent implements OnInit {
  @ViewChild('dialogoComentario') dialogoComentario!: TemplateRef<any>;
  dialogoComentarioRef!: MatDialogRef<any>;

  public nombreApellido: string = '';
  public idUsuario: number = -1;
  public diasDelMes: any[] = [];
  public columnas = ['nombre', 'fecha', 'horaEntrada', 'horaSalida', 'comentario', 'acciones'];
  public fechaHoy = new Date();
  public horaEntrada: string = '';
  public horaSalida: string = '';
  public presente: boolean = false;
  public salida: boolean = false;
  public botonPresenteDeshabilitado: boolean = false;
  public botonSalidaDeshabilitado: boolean = false;
  public asistencias: any[] = [];
  public isSearchingAsistencias = true;
  public asistencia = new Asistencia();
  public form: FormGroup;
  public comentario: string = '';

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
  }

  consultarAsistencias(): void {
    this.usuariosService.consultarAsistencias().subscribe({
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

        this.isSearchingAsistencias = false;
        this.verificarAsistencias();
      },
      error: (err) => {
        console.error('Error al consultar asistencias:', err);
        this.notificacionService.openSnackBarError('Error al cargar asistencias. Intente nuevamente.');
      }
    });
  }

  buscarAsistenciaHoy(): Asistencia {
    const fechaHoy = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const idUsuario = this.idUsuario;

    // Buscar la asistencia para hoy del usuario
    const asistenciaHoy = this.asistencias.find(
      asistencia =>
        asistencia.idUsuario === idUsuario &&
        asistencia.fecha?.startsWith(fechaHoy)
    );

    return asistenciaHoy
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
      Esta acción no es reversible.`, 'Marcar Entrada')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          if (!this.botonPresenteDeshabilitado) {

            this.asistencia.fecha = new Date();
            this.asistencia.horaEntrada = new Date().toLocaleTimeString('en-GB', { hour12: false });
            this.asistencia.idUsuario = this.idUsuario;

            this.usuariosService.registrarAsistencia(this.asistencia).subscribe({
              next: (respuesta) => {
                if (respuesta.mensaje === 'OK') {
                  this.notificacionService.openSnackBarSuccess('La entrada se registró con éxito');
                  this.presente = true;
                  this.botonPresenteDeshabilitado = true;
                  this.botonSalidaDeshabilitado = false;
                  this.consultarAsistencias();
                } else
                {
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

  abrirDialogComentario(): void {
    this.dialogoComentarioRef = this.dialog.open(this.dialogoComentario, {
      width: '75%',
      autoFocus: false
    });
  }

  guardarComentario(): void {
    if (this.form.valid) {
      this.comentario = this.form.get('txComentario')?.value;

      const asistenciaHoy = this.buscarAsistenciaHoy();
      asistenciaHoy.comentario = this.comentario;

      this.usuariosService.modificarAsistencia(asistenciaHoy).subscribe({
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

  get txComentario(): FormControl {
    return this.form.get('txComentario') as FormControl;
  }
}
