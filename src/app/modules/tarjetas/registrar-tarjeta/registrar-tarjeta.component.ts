import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarTarjetasComponent} from "../consultar-tarjetas/consultar-tarjetas.component";
import {CuotaPorTarjeta} from "../../../models/cuotaPorTarjeta.model";
import {TipoTarjeta} from "../../../models/tipoTarjeta.model";
import {Tarjeta} from "../../../models/tarjeta.model";
import {TarjetasService} from "../../../services/tarjetas.service";
import {FiltrosTarjetas} from "../../../models/comandos/FiltrosTarjetas.comando";
import {Cuota} from "../../../models/Cuota.model";

@Component({
  selector: 'app-registrar-tarjeta',
  templateUrl: './registrar-tarjeta.component.html',
  styleUrl: './registrar-tarjeta.component.scss'
})
export class RegistrarTarjetaComponent {

  public form: FormGroup;
  private referencia: ConsultarTarjetasComponent;

  public tarjetas: Tarjeta[] = [];
  public listaCuotas: Cuota[] = [];
  public cuotasSeleccionadas: CuotaPorTarjeta[] = [];
  public columnas: string[] = ['seleccionar', 'cuota', 'recargo', 'descuento'];
  public listaTiposTarjetas: TipoTarjeta[] = [];

  public tarjeta: Tarjeta;
  public esConsulta: boolean;
  public esRegistro: boolean;
  public formDesactivado: boolean;

  public dataSourceCuotas = new MatTableDataSource(this.listaCuotas);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private tarjetasService: TarjetasService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarTarjetasComponent
      tarjeta: Tarjeta;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      esRegistro: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.tarjeta = this.data.tarjeta;
    this.esConsulta = this.data.esConsulta;
    this.esRegistro = this.data.esRegistro;
    this.formDesactivado = this.data.formDesactivado;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarTarjetas();
    this.buscarTiposTarjetas();
    this.buscarCuotas();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txTarjeta: ['', [Validators.required]],
      txTipoTarjeta: ['', [Validators.required]],
    });
  }

  private buscarTiposTarjetas() {
    this.tarjetasService.buscarTiposTarjetas().subscribe((tipos) => {
      this.listaTiposTarjetas = tipos;
    });
  }

  private buscarTarjetas() {
    this.tarjetasService.consultarTarjetas(new FiltrosTarjetas()).subscribe((tarjetas) => {
      this.tarjetas = tarjetas;

      if (this.esConsulta && this.tarjetas) {
        this.rellenarFormularioDataPedido();
      }
    });
  }

  private buscarCuotas() {
    this.tarjetasService.buscarCuotas().subscribe((cuotas) => {
      this.listaCuotas = cuotas;
      this.dataSourceCuotas.data = this.listaCuotas;
      this.cdr.detectChanges();
    });
  }

  private rellenarFormularioDataPedido() {
    this.txTarjeta.setValue(this.tarjeta.nombre);
    this.txTipoTarjeta.setValue(this.tarjeta.idTipoTarjeta);

    this.tarjeta.cuotaPorTarjeta.forEach((cuota: CuotaPorTarjeta) => {
      // TODO
    });

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  public habilitarEdicion(){
    this.form.enable();
    this.data.formDesactivado = false;
    this.formDesactivado = false;
    this.data.editar = true;
  }

  public registrarNuevaTarjeta() {

    if (this.form.valid) {
      const tarjeta: Tarjeta = new Tarjeta();

      tarjeta.nombre = this.txTarjeta.value;
      tarjeta.idTipoTarjeta = this.txTipoTarjeta.value;

      // Por cada cuota seleccionado, creamos una cuota por tarjeta.
      // TODO

      //tarjeta.cuotaPorTarjeta = cuotaPorTarjeta;

      this.tarjetasService.registrarTarjeta(tarjeta).subscribe((respuesta) => {
        if (respuesta.mensaje === 'OK') {
          this.notificacionService.openSnackBarSuccess('La tarjeta se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar una tarjeta, inténtelo nuevamente');
        }
      });
    }
  }

  public modificarTarjeta() {
    if (this.form.valid) {
      const tarjeta: Tarjeta = new Tarjeta();

      tarjeta.id = this.data.tarjeta?.id;
      tarjeta.nombre = this.txTarjeta.value;
      tarjeta.idTipoTarjeta = this.txTipoTarjeta.value;

      // Por cada cuota seleccionado, creamos una cuota por tarjeta.
      // TODO

      //tarjeta.cuotaPorTarjeta = cuotaPorTarjeta;

      this.tarjetasService.modificarTarjeta(tarjeta).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Tarjeta modificada con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar la tarjeta');
        }
      });
    }
  }

  // Método para seleccionar o deseleccionar una cuota
  toggleSelection(event: any, cuota: any): void {
    cuota.selected = event.checked;
  }

  // Verificar si la cuota está seleccionada
  isSelected(cuota: any): boolean {
    return cuota.selected;
  }

  // Método para actualizar el valor de recargo
  onRecargoChange(tarjeta: any, recargo: number): void {
    tarjeta.cuotaPorTarjeta.recargo = recargo;
  }

  // Método para actualizar el valor de descuento
  onDescuentoChange(tarjeta: any, descuento: number): void {
    tarjeta.cuotaPorTarjeta.descuento = descuento;
  }

  enableEdit(cuota: any, field: string) {
    if (field === 'recargo') {
      cuota.isEditingRecargo = true;
    } else if (field === 'descuento') {
      cuota.isEditingDescuento = true;
    }
  }

  disableEdit(cuota: any, field: string) {
    if (field === 'recargo') {
      cuota.isEditingRecargo = false;
    } else if (field === 'descuento') {
      cuota.isEditingDescuento = false;
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  // Getters
  get txTarjeta(): FormControl {
    return this.form.get('txTarjeta') as FormControl;
  }

  get txTipoTarjeta(): FormControl {
    return this.form.get('txTipoTarjeta') as FormControl;
  }
}
