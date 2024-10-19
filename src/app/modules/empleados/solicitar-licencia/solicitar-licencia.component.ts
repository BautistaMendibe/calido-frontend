import {Component, Inject, OnInit} from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {MarcarAsistenciaComponent} from "../marcar-asistencia/marcar-asistencia.component";
import {Motivo} from "../../../models/motivo.model";

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

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
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
      // TODO: Registrar licencia
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
