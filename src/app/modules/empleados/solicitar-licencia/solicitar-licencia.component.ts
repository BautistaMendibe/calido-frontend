import {Component, Inject, OnInit} from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {MarcarAsistenciaComponent} from "../marcar-asistencia/marcar-asistencia.component";
import {Motivo} from "../../../models/motivo.model";
import {Licencia} from "../../../models/licencia.model";
import {NotificationService} from "../../../services/notificacion.service";
import {SpResult} from "../../../models/resultadoSp.model";

@Component({
  selector: 'app-solicitar-licencia',
  templateUrl: './solicitar-licencia.component.html',
  styleUrl: './solicitar-licencia.component.scss'
})
export class SolicitarLicenciaComponent implements OnInit {

  public form: FormGroup;
  private referencia: MarcarAsistenciaComponent;

  public listaMotivos: Motivo[] = [];
  public diasSeleccionados = 0;
  public fechaMinima: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: MarcarAsistenciaComponent
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.obtenerMotivos();
    this.filtrosSuscripciones();
  }

  private crearFormulario(){
    this.form = this.fb.group({
      txPeriodo: this.fb.group({
        txPeriodoInicio: [null, Validators.required],
        txPeriodoFin: [null, Validators.required]
      }),
      txComentario: ['', [Validators.maxLength(200)]],
      txMotivo: ['', [Validators.required]],
    });
  }

  private obtenerMotivos(){
    this.usuariosService.obtenerMotivosLicencia().subscribe((motivos) => {
      this.listaMotivos = motivos;
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

  public aceptar() {
    if (this.form.valid) {
      const licencia: Licencia = new Licencia();

      const fechaInicioNueva = this.txPeriodo.get('txPeriodoInicio')?.value;
      const fechaFinNueva = this.txPeriodo.get('txPeriodoFin')?.value;

      licencia.idUsuario = this.referencia.idUsuario;
      licencia.fechaInicio = fechaInicioNueva;
      licencia.fechaFin = fechaFinNueva;
      licencia.idMotivoLicencia = this.txMotivo.value;
      licencia.comentario = this.txComentario.value;
      licencia.idEstadoLicencia = 1; // Pendiente siempre

      // Validación de superposición de fechas
      const existeSuperposicion = this.referencia.licencias.some((licenciaExistente: Licencia) => {
        const fechaInicioExistente = new Date(licenciaExistente.fechaInicio);
        const fechaFinExistente = new Date(licenciaExistente.fechaFin);

        // Comprobar si las fechas se superponen
        return (
          (fechaInicioNueva >= fechaInicioExistente && fechaInicioNueva <= fechaFinExistente) ||
          (fechaFinNueva >= fechaInicioExistente && fechaFinNueva <= fechaFinExistente) ||
          (fechaInicioNueva <= fechaInicioExistente && fechaFinNueva >= fechaFinExistente)
        );
      });

      if (existeSuperposicion) {
        this.notificacionService.openSnackBarError('Ya existe una licencia en el periodo seleccionado.');
        return; // No continuar si hay superposición
      }

      // Si no hay superposición, continuar con el proceso de solicitud de licencia
      this.notificationDialogService.confirmation(
        '¿Está seguro de solicitar la licencia?',
        'Solicitar licencia',
      )
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            this.usuariosService.registrarLicencia(licencia).subscribe((res: SpResult) => {
              if (res.mensaje == 'OK') {
                this.notificacionService.openSnackBarSuccess('Licencia solicitada con éxito');
                this.dialogRef.close();
              } else {
                this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al solicitar licencia');
              }
            });
          }
        }, (error) => {
          this.notificacionService.openSnackBarError('Error al solicitar licencia');
        });
    }
  }

  public cancelar() {
    this.dialogRef.close();
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
}
