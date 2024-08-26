import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Asistencia} from "../../../models/asistencia";
import {ConsultarAsistenciaComponent} from "../consultar-asistencia/consultar-asistencia.component";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";

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

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
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
    this.crearFormulario();
    this.buscarEmpleados();

    if (this.esConsulta && this.asistencia) {
      this.rellenarFormularioDataUsuario();
    }
  }

  private buscarEmpleados(){
    this.usuariosService.consultarUsuarios(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaEmpleados = usuarios;
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txEmpleados: ['', [Validators.required]],
      txFecha: ['', [Validators.required]],
      txHoraEntrada: ['', [Validators.required]],
      txHoraSalida: ['', [Validators.required]],
      txComentario: ['', [Validators.maxLength(200)]],
    });
  }


  private rellenarFormularioDataUsuario() {

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


      this.usuariosService.registrarAsistencia(asistencia).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La asistencia se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar una asistencia, inténtelo nuevamente');
        }
      })

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

      this.usuariosService.modificarAsistencia(asistencia).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Asistencia modificada con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar la asistencia');
        }
      })
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
