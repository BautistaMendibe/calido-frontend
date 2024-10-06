import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
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
export class RegistrarTarjetaComponent implements OnInit {

  public form: FormGroup;
  private referencia: ConsultarTarjetasComponent;

  public tarjetas: Tarjeta[] = [];
  public listaCuotas: Cuota[] = [];
  public cuotasSeleccionadas: CuotaPorTarjeta[] = [];
  public columnas: string[] = ['seleccionar', 'cuota', 'interes', 'recargo', 'descuento'];
  public listaTiposTarjetas: TipoTarjeta[] = [];

  public tarjeta: Tarjeta;
  public esConsulta: boolean;
  public esRegistro: boolean;
  public formDesactivado: boolean;
  public listaCuotasDeshabilitada: boolean = false;
  protected readonly Math = Math;

  public dataSourceCuotas = new MatTableDataSource(this.listaCuotas);

  constructor(
    private fb: FormBuilder,
    private tarjetasService: TarjetasService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
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

    if (this.data.editar) {
      this.listaCuotasDeshabilitada = false;
    }
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
        this.rellenarFormularioDataTarjeta();
      }
    });
  }

  private buscarCuotas() {
    this.tarjetasService.buscarCuotas().subscribe((cuotas) => {
      this.listaCuotas = cuotas;
      this.dataSourceCuotas.data = this.listaCuotas;
    });
  }

  private rellenarFormularioDataTarjeta() {
    this.txTarjeta.setValue(this.tarjeta.nombre);
    this.txTipoTarjeta.setValue(this.tarjeta.idTipoTarjeta);

    this.tarjeta.cuotaPorTarjeta.forEach((cuota: CuotaPorTarjeta) => {
      const cuotaEncontrada = this.listaCuotas.find(item => item.id === cuota.idCuota);

      if (cuotaEncontrada) {
        // Encuentra la fila en dataSourceCuotas que coincide con la cantidad de cuotas.
        const fila = this.dataSourceCuotas.data.find(f => f.cantidadCuotas === cuotaEncontrada.cantidadCuotas);

        // Rellena los datos de las filas
        if (fila) {
          (fila as any).selected = true;
          (fila as any).interes = cuota.interes;
          (fila as any).recargo = cuota.recargo;
          (fila as any).descuento = cuota.descuento;

          // Simula una selección, para agregar la cuota a la lista de cuotas seleccionadas
          const event = { checked: true };
          this.toggleSelection(event, fila);
        }
      }
    });

    // Actualiza el dataSourceCuotas para que se reflejen los cambios
    this.dataSourceCuotas.data = [...this.dataSourceCuotas.data];

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
      tarjeta.cuotaPorTarjeta = [];

      this.cuotasSeleccionadas.forEach((cuotaSeleccionada) => {
        const cuotaPorTarjeta: CuotaPorTarjeta = new CuotaPorTarjeta();

        cuotaPorTarjeta.interes = cuotaSeleccionada.interes;
        cuotaPorTarjeta.idCuota = cuotaSeleccionada.idCuota;
        cuotaPorTarjeta.recargo = cuotaSeleccionada.recargo;
        cuotaPorTarjeta.descuento = cuotaSeleccionada.descuento;

        // Agregar la cuota a la lista de la tarjeta
        tarjeta.cuotaPorTarjeta.push(cuotaPorTarjeta);
      });

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
      tarjeta.cuotaPorTarjeta = [];

      this.cuotasSeleccionadas.forEach((cuotaSeleccionada) => {
        const cuotaPorTarjeta: CuotaPorTarjeta = new CuotaPorTarjeta();

        cuotaPorTarjeta.interes = cuotaSeleccionada.interes;
        cuotaPorTarjeta.idCuota = cuotaSeleccionada.idCuota;
        cuotaPorTarjeta.idTarjeta = cuotaSeleccionada.idTarjeta;
        cuotaPorTarjeta.recargo = cuotaSeleccionada.recargo;
        cuotaPorTarjeta.descuento = cuotaSeleccionada.descuento;

        // Agregar la cuota a la lista de la tarjeta
        tarjeta.cuotaPorTarjeta.push(cuotaPorTarjeta);
      });

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

  // Método para guardar cuotas seleccionadas en lista
  public toggleSelection(event: any, cuota: any) {
    if (event.checked) {
      cuota.selected = true;

      const cuotaEncontrada = this.listaCuotas.find(c => c.cantidadCuotas === cuota.cantidadCuotas);

      if (!cuotaEncontrada) {
        return; // No encontró la cuota correspondiente.
      }

      const idCuota = cuotaEncontrada.id

      // Crear el objeto CuotaPorTarjeta basado en los datos de la cuota seleccionada
      const cuotaPorTarjeta: CuotaPorTarjeta = {
        id: cuota.id,
        interes: cuota.interes,
        idCuota: idCuota,
        idTarjeta: this.tarjeta.id,
        recargo: cuota.recargo,
        descuento: cuota.descuento
      };

      // Agregar a la lista de cuotas seleccionadas
      this.cuotasSeleccionadas.push(cuotaPorTarjeta);
    } else {
      // Eliminar la cuota de la lista si se quita selección
      this.cuotasSeleccionadas = this.cuotasSeleccionadas.filter(c => c.id !== cuota.id);
      cuota.selected = false;
    }
  }

  // Método para verificar si una cuota está seleccionada
  public isSelected(cuota: any): boolean {
    return cuota.selected;
  }

  // Método para habilitar la edición de un campo en la cuota seleccionada
  public toggleEdit(cuota: any, campo: string): void {
    if (this.isSelected(cuota)) {
      cuota[`isEditing${this.capitalize(campo)}`] = true;
    }
  }

  // Método para guardar los cambios en la cuota seleccionada
  public disableEdit(cuota: any, campo: string): void {
    cuota[`isEditing${this.capitalize(campo)}`] = false;

    const cuotaSeleccionada = this.cuotasSeleccionadas.find(c => c.id === cuota.id);
    if (cuotaSeleccionada) {
      cuotaSeleccionada[campo as keyof CuotaPorTarjeta] = cuota[campo as keyof CuotaPorTarjeta];
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
