import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {CajasService} from "../../../services/cajas.service";
import {Caja} from "../../../models/Caja.model";
import {ConsultarArqueoCajaComponent} from "../consultar-arqueo-caja/consultar-arqueo-caja.component";
import {Arqueo} from "../../../models/Arqueo.model";
import {FiltrosCajas} from "../../../models/comandos/FiltrosCaja.comando";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {Usuario} from "../../../models/usuario.model";

@Component({
  selector: 'app-registrar-arqueo-caja',
  templateUrl: './registrar-arqueo-caja.component.html',
  styleUrl: './registrar-arqueo-caja.component.scss'
})
export class RegistrarArqueoCajaComponent implements OnInit {
  public form: FormGroup;

  public esConsulta: boolean;
  public esRegistro: boolean;
  public formDesactivado: boolean;
  private referencia: ConsultarArqueoCajaComponent;

  public fechaHoy: Date;
  public listaCajas: Caja[] = [];
  public listaEmpleados: Usuario[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegistrarArqueoCajaComponent>,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private cajasService: CajasService,
    private usuariosService: UsuariosService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarArqueoCajaComponent;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      arqueo: Arqueo;
      esRegistro: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.esConsulta = this.data.esConsulta;
    this.esRegistro = this.data.esRegistro;
    this.formDesactivado = this.data.formDesactivado;
    this.referencia = this.data.referencia;
    this.fechaHoy = new Date();
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarCajas();
    this.buscarEmpleados();

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txCaja: [this.data.arqueo?.caja.id || '', [Validators.required]],
      txFechaApertura: [this.data.arqueo?.fechaApertura || new Date(), [Validators.required]],
      txHoraApertura: [this.data.arqueo?.horaApertura || '', [Validators.required]],
      txMontoInicial: [this.data.arqueo?.montoInicial || '', [Validators.required]],
      txResponsable: [this.data.arqueo?.responsable?.id || '', [Validators.required]]
    });
  }

  private buscarCajas(){
    this.cajasService.consultarCajas(new FiltrosCajas()).subscribe((cajas) => {
      this.listaCajas = cajas;
    });
  }

  private buscarEmpleados(){
    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((empleados) => {
      this.listaEmpleados = empleados;
    });
  }

  public registrarArqueo() {
    if (this.form.valid) {
      const arqueo = this.construirArqueo();
      arqueo.idEstadoArqueo = 1;
      this.cajasService.registrarArqueo(arqueo).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'El arqueo se registró con éxito');
      });
    }
  }

  public modificarArqueo() {
    if (this.form.valid) {
      const arqueo = this.construirArqueo(this.data.arqueo?.id);
      this.cajasService.modificarArqueo(arqueo).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'El arqueo se modificó con éxito');
        this.referencia.buscar();
      });
    }
  }

  private construirArqueo(id?: number): any {
    return {
      id: id || undefined,
      idCaja: this.txCaja.value,
      fechaApertura: this.txFechaApertura.value,
      horaApertura: this.txHoraApertura.value,
      montoInicial: this.txMontoInicial.value,
      responsable: this.txResponsable.value
    } as Arqueo;
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
    this.txCaja.disable();
    this.txFechaApertura.disable();
    this.txHoraApertura.disable();

    if (this.data.arqueo?.idEstadoArqueo == 2) {
      this.txMontoInicial.disable();
      this.txResponsable.disable();
    }

    this.formDesactivado = false;
    this.data.editar = true;
  }

  // Región getters
  get txCaja() {
    return this.form.get('txCaja') as FormControl;
  }

  get txFechaApertura() {
    return this.form.get('txFechaApertura') as FormControl;
  }

  get txHoraApertura() {
    return this.form.get('txHoraApertura') as FormControl;
  }

  get txMontoInicial() {
    return this.form.get('txMontoInicial') as FormControl;
  }

  get txResponsable() {
    return this.form.get('txResponsable') as FormControl;
  }
}
