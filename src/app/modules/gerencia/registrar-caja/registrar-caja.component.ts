import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarCajaComponent} from "../consultar-caja/consultar-caja.component";
import {Caja} from "../../../models/Caja.model";
import {CajasService} from "../../../services/cajas.service";
import {ThemeCalidoService} from "../../../services/theme.service";

@Component({
  selector: 'app-registrar-caja',
  templateUrl: './registrar-caja.component.html',
  styleUrl: './registrar-caja.component.scss'
})
export class RegistrarCajaComponent implements OnInit {
  public form: FormGroup;

  public esConsulta: boolean;
  public esRegistro: boolean;
  public formDesactivado: boolean;
  private referencia: ConsultarCajaComponent;
  public darkMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegistrarCajaComponent>,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private cajasService: CajasService,
    private themeService: ThemeCalidoService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarCajaComponent;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      caja: Caja;
      esRegistro: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.esConsulta = this.data.esConsulta;
    this.esRegistro = this.data.esRegistro;
    this.formDesactivado = this.data.formDesactivado;
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: [this.data.caja?.nombre || '', [Validators.required]],
      txDescripcion: [this.data.caja?.descripcion || '', [Validators.maxLength(200)]],
    });
  }

  public registrarCaja() {
    if (this.form.valid) {
      const caja = this.construirCaja();
      this.cajasService.registrarCaja(caja).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La caja se registró con éxito');
      });
    }
  }

  public modificarCaja() {

    if (this.form.valid) {
      const caja = this.construirCaja(this.data.caja?.id);
      this.cajasService.modificarCaja(caja).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La caja se modificó con éxito');
        this.referencia.buscar();
      });
    }
  }

  private construirCaja(id?: number): any {
    return {
      id: id || undefined,
      nombre: this.txNombre.value,
      descripcion: this.txDescripcion.value
    } as Caja;
  }

  private gestionarRespuesta(respuesta: any, mensajeExito: string) {
    if (respuesta.mensaje === 'OK') {
      this.notificacionService.openSnackBarSuccess(mensajeExito);
      this.referencia.buscar();
      this.dialogRef.close();
    } else {
      this.notificacionService.openSnackBarError('Error al procesar la solicitud, intentelo nuevamente');
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public habilitarEdicion(){
    this.form.enable();
    this.formDesactivado = false;
    this.data.editar = true;
  }

  // Región getters
  get txNombre() {
    return this.form.get('txNombre') as FormControl;
  }

  get txDescripcion() {
    return this.form.get('txDescripcion') as FormControl;
  }
}
