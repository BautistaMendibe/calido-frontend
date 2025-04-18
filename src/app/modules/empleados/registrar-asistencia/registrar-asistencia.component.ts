import {Component, Inject, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Asistencia} from "../../../models/asistencia";
import {ConsultarAsistenciaComponent} from "../consultar-asistencia/consultar-asistencia.component";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {Licencia} from "../../../models/licencia.model";
import {ThemeCalidoService} from "../../../services/theme.service";

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.component.html',
  styleUrl: './registrar-asistencia.component.scss'
})
export class RegistrarAsistenciaComponent implements OnInit {


  public form: FormGroup;
  private referencia: ConsultarAsistenciaComponent;

  public listaEmpleados: Usuario[] = [];

  public asistencia: Asistencia;
  public esConsulta: boolean;
  public formDesactivado: boolean;
  public darkMode: boolean = false;

  public fechaHoy: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private themeService: ThemeCalidoService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarAsistenciaComponent;
      asistencia: Asistencia;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.asistencia = this.data.asistencia;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();
    this.buscarEmpleados();

    if (this.esConsulta && this.asistencia) {
      this.rellenarFormularioDataAsistencia();
    }
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private buscarEmpleados(){
    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaEmpleados = usuarios;
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txEmpleados: ['', [Validators.required]],
      txFecha: ['', [Validators.required]],
      txHoraEntrada: ['', [Validators.required]],
      txHoraSalida: ['', [Validators.required, this.horaSalidaMayorQueEntradaValidator]],
      txComentario: ['', [Validators.maxLength(200)]],
    });

    this.form.get('txHoraEntrada')?.valueChanges.subscribe(() => {
      this.form.get('txHoraSalida')?.updateValueAndValidity();
    });
  }

  horaSalidaMayorQueEntradaValidator = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) return null;

    const horaEntrada = formGroup.get('txHoraEntrada')?.value;
    const horaSalida = control.value;

    if (horaEntrada && horaSalida) {

      if (horaSalida <= horaEntrada) {
        return { horaInvalida: true };
      }
    }

    return null;
  };

  private rellenarFormularioDataAsistencia() {

    this.txEmpleados.setValue(this.asistencia.idUsuario);
    this.txFecha.setValue(this.asistencia.fecha);
    this.txHoraEntrada.setValue(this.asistencia.horaEntrada);
    this.txHoraSalida.setValue(this.asistencia.horaSalida);
    this.txComentario.setValue(this.asistencia.comentario);

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  public habilitarEdicion(){
    this.form.enable();
    this.data.editar = true;
  }

  public registrarNuevaAsistencia() {
    if (this.form.valid) {
      const asistencia: Asistencia = new Asistencia();

      asistencia.idUsuario = this.txEmpleados.value;
      asistencia.fecha = this.txFecha.value;
      asistencia.horaEntrada = this.txHoraEntrada.value;
      asistencia.horaSalida = this.txHoraSalida.value;
      asistencia.comentario = this.txComentario.value;

      // Validación de superposición con licencias
      const fechaAsistencia = new Date(asistencia.fecha);
      const existeSuperposicionLicencia = this.referencia.licencias.some((licenciaExistente: Licencia) => {
        const fechaInicioExistente = new Date(licenciaExistente.fechaInicio);
        const fechaFinExistente = new Date(licenciaExistente.fechaFin);

        // Comprobar si la fecha de asistencia coincide con las fechas de la licencia (incluidos los extremos)
        return (
          (fechaAsistencia >= fechaInicioExistente && fechaAsistencia <= fechaFinExistente)
        );
      });

      if (existeSuperposicionLicencia) {
        this.notificacionService.openSnackBarError('No puede registrar asistencia en días que tiene licencia.');
        return; // No continuar si hay superposición con licencias
      }

      this.usuariosService.registrarAsistencia(asistencia).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La asistencia se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar una asistencia, inténtelo nuevamente');
        }
      });
    }
  }

  public modificarAsistencia() {
    if (this.form.valid) {
      const asistencia: Asistencia = new Asistencia();
      asistencia.id = this.data.asistencia.id;
      asistencia.idUsuario = this.data.asistencia.idUsuario;
      asistencia.fecha = this.txFecha.value.split('T')[0];
      asistencia.horaEntrada = this.txHoraEntrada.value;
      asistencia.horaSalida = this.txHoraSalida.value;
      asistencia.comentario = this.txComentario.value;

      // Validación de superposición con licencias
      const fechaAsistencia = new Date(asistencia.fecha);
      const existeSuperposicionLicencia = this.referencia.licencias.some((licenciaExistente: Licencia) => {
        const fechaInicioExistente = new Date(licenciaExistente.fechaInicio);
        const fechaFinExistente = new Date(licenciaExistente.fechaFin);

        // Comprobar si la fecha de asistencia coincide con las fechas de la licencia (incluidos los extremos)
        return (
          (fechaAsistencia >= fechaInicioExistente && fechaAsistencia <= fechaFinExistente)
        );
      });

      if (existeSuperposicionLicencia) {
        this.notificacionService.openSnackBarError('No puede modificar la asistencia a días que tiene licencia.');
        return; // No continuar si hay superposición con licencias
      }

      this.usuariosService.modificarAsistencia(asistencia).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Asistencia modificada con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar la asistencia');
        }
      });
    }
  }



  public cancelar() {
    this.dialogRef.close();
  }

  // Getters

  get txFecha(): FormControl {
    return this.form.get('txFecha') as FormControl;
  }

  get txHoraEntrada(): FormControl {
    return this.form.get('txHoraEntrada') as FormControl;
  }

  get txHoraSalida(): FormControl {
    return this.form.get('txHoraSalida') as FormControl;
  }

  get txComentario(): FormControl {
    return this.form.get('txComentario') as FormControl;
  }

  get txEmpleados(): FormControl {
    return this.form.get('txEmpleados') as FormControl;
  }

}
