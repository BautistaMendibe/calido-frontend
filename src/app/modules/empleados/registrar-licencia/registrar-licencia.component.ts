import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Motivo} from "../../../models/motivo.model";
import {ConsultarAsistenciaComponent} from "../consultar-asistencia/consultar-asistencia.component";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {Usuario} from "../../../models/usuario.model";
import {Asistencia} from "../../../models/asistencia";
import {Licencia} from "../../../models/licencia.model";
import {SpResult} from "../../../models/resultadoSp.model";
import {EstadoLicencia} from "../../../models/estadoLicencia.model";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";

@Component({
  selector: 'app-registrar-licencia',
  templateUrl: './registrar-licencia.component.html',
  styleUrl: './registrar-licencia.component.scss'
})
export class RegistrarLicenciaComponent implements OnInit {

  public form: FormGroup;
  private referencia: ConsultarAsistenciaComponent;

  public listaMotivos: Motivo[] = [];
  public listaEmpleados: Usuario[] = [];
  public diasSeleccionados = 0;
  public listaEstados: EstadoLicencia[] = [];

  public licencia: Licencia;
  public esConsulta: boolean;
  public formDesactivado: boolean;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarAsistenciaComponent,
      licencia: Licencia;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.licencia = this.data.licencia;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.obtenerMotivos();
    this.obtenerEstadosLicencia();
    this.obtenerEmpleados();
    this.filtrosSuscripciones();

    if (this.esConsulta && this.licencia) {
      this.rellenarFormularioDataLicencia();
    }
  }

  private crearFormulario(){
    this.form = this.fb.group({
      txPeriodo: this.fb.group({
        txPeriodoInicio: [null, Validators.required],
        txPeriodoFin: [null, Validators.required]
      }),
      txComentario: ['', [Validators.maxLength(200)]],
      txMotivo: ['', [Validators.required]],
      txEmpleado: ['', [Validators.required]],
      txEstado: ['', [Validators.required]]
    });
  }

  private obtenerEmpleados() {
    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaEmpleados = usuarios;
    });
  }

  private obtenerMotivos(){
    this.usuariosService.obtenerMotivosLicencia().subscribe((motivos) => {
      this.listaMotivos = motivos;
    });
  }

  private obtenerEstadosLicencia() {
    this.usuariosService.obtenerEstadosLicencia().subscribe((estados) => {
      this.listaEstados = estados;
    });
  }

  private filtrosSuscripciones() {
    this.txPeriodo.valueChanges.subscribe((value) => {
      const inicio = value.txPeriodoInicio;
      const fin = value.txPeriodoFin;

      if (inicio && fin) {
        this.calcularDias(inicio, fin);
      } else {
        this.diasSeleccionados = 0;
      }
    });
  }

  public calcularDias(inicio: Date, fin: Date) {
    const diffTime = Math.abs(new Date(fin).getTime() - new Date(inicio).getTime());
    this.diasSeleccionados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio
  }

  private rellenarFormularioDataLicencia() {

    this.txEmpleado.setValue(this.licencia.idUsuario);
    this.txPeriodo.get('txPeriodoInicio')?.setValue(this.licencia.fechaInicio);
    this.txPeriodo.get('txPeriodoFin')?.setValue(this.licencia.fechaFin);
    this.txMotivo.setValue(this.licencia.idMotivoLicencia);
    this.txComentario.setValue(this.licencia.comentario);
    this.txEstado.setValue(this.licencia.idEstadoLicencia);

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  public registrarNuevaLicencia() {
    if (this.form.valid) {
      const licencia: Licencia = new Licencia();

      const fechaInicioNueva = this.txPeriodo.get('txPeriodoInicio')?.value;
      const fechaFinNueva = this.txPeriodo.get('txPeriodoFin')?.value;

      licencia.idUsuario = this.txEmpleado.value;
      licencia.fechaInicio = fechaInicioNueva;
      licencia.fechaFin = fechaFinNueva;
      licencia.idMotivoLicencia = this.txMotivo.value;
      licencia.comentario = this.txComentario.value;
      licencia.idEstadoLicencia = this.txEstado.value;

      // Validación de superposición de fechas con licencias
      const existeSuperposicionLicencia = this.referencia.licencias.some((licenciaExistente: Licencia) => {
        const fechaInicioExistente = new Date(licenciaExistente.fechaInicio);
        const fechaFinExistente = new Date(licenciaExistente.fechaFin);

        // Comprobar si las fechas se superponen o coinciden exactamente
        return (
          (fechaInicioNueva < fechaFinExistente && fechaFinNueva > fechaInicioExistente) ||
          (fechaInicioNueva <= fechaInicioExistente && fechaFinNueva >= fechaFinExistente)
        );
      });

      // Validación de superposición con asistencias
      const existeSuperposicionAsistencia = this.referencia.asistencias.some((asistenciaExistente: Asistencia) => {
        const fechaAsistenciaExistente = new Date(asistenciaExistente.fecha);

        // Comprobar si alguna fecha de licencia coincide con una fecha de asistencia
        return (
          (fechaInicioNueva <= fechaAsistenciaExistente && fechaFinNueva >= fechaAsistenciaExistente)
        );
      });

      if (existeSuperposicionLicencia) {
        this.notificacionService.openSnackBarError('Ya existe una licencia en el periodo seleccionado.');
        return; // No continuar si hay superposición de licencias
      }

      if (existeSuperposicionAsistencia) {
        this.notificacionService.openSnackBarError('No puede solicitar una licencia en días que ya marcó como presente.');
        return; // No continuar si hay superposición con asistencias
      }

      // Si no hay superposición, continuar con el proceso de solicitud de licencia
      this.notificationDialogService.confirmation(
        '¿Está seguro de registrar la licencia?',
        'Solicitar licencia',
      )
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            this.usuariosService.registrarLicencia(licencia).subscribe((res: SpResult) => {
              if (res.mensaje == 'OK') {
                this.notificacionService.openSnackBarSuccess('Licencia registrada con éxito');
                this.dialogRef.close();
                this.referencia.buscar();
              } else {
                this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al registrar licencia');
              }
            });
          }
        }, (error) => {
          this.notificacionService.openSnackBarError('Error al registrar licencia');
        });
    }
  }

  public modificarLicencia() {
    if (this.form.valid) {
      const licencia: Licencia = new Licencia();
      licencia.id = this.data.licencia.id;
      licencia.idUsuario = this.txEmpleado.value;
      licencia.fechaInicio = this.txPeriodo.get('txPeriodoInicio')?.value;
      licencia.fechaFin = this.txPeriodo.get('txPeriodoFin')?.value;
      licencia.idMotivoLicencia = this.txMotivo.value;
      licencia.comentario = this.txComentario.value;
      licencia.idEstadoLicencia = this.txEstado.value;

      // Validación de superposición con asistencias
      const fechaInicioLicencia = new Date(licencia.fechaInicio);
      const fechaFinLicencia = new Date(licencia.fechaFin);
      const existeSuperposicionAsistencia = this.referencia.asistencias.some((asistenciaExistente: Asistencia) => {
        const fechaAsistenciaExistente = new Date(asistenciaExistente.fecha);

        // Comprobar si la fecha de la asistencia está dentro del rango de la licencia (incluidos los extremos)
        return (
          (fechaAsistenciaExistente >= fechaInicioLicencia && fechaAsistenciaExistente <= fechaFinLicencia)
        );
      });

      if (existeSuperposicionAsistencia) {
        this.notificacionService.openSnackBarError('No puede modificar la licencia a un periodo que ya tiene asistencia registrada.');
        return; // No continuar si hay superposición con asistencias
      }

      this.usuariosService.modificarLicencia(licencia).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Licencia modificada con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar la licencia');
        }
      });
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public habilitarEdicion(){
    this.form.enable();
    this.data.editar = true;
  }

  // Getters
  get txPeriodo(): FormGroup {
    return this.form.get('txPeriodo') as FormGroup;
  }

  get txComentario(): FormControl {
    return this.form.get('txComentario') as FormControl;
  }

  get txMotivo(): FormControl {
    return this.form.get('txMotivo') as FormControl;
  }

  get txEmpleado(): FormControl {
    return this.form.get('txEmpleado') as FormControl;
  }

  get txEstado(): FormControl {
    return this.form.get('txEstado') as FormControl;
  }
}
