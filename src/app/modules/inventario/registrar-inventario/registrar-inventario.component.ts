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
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {DetalleProducto} from "../../../models/detalleProducto";
import {ConsultarInventarioComponent} from "../consultar-inventario/consultar-inventario.component";
import {Producto} from "../../../models/producto.model";
import {ProductosService} from "../../../services/productos.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {MovimientoProducto} from "../../../models/movimientoProducto";
import {MatTableDataSource} from "@angular/material/table";
import {Venta} from "../../../models/venta.model";

@Component({
  selector: 'app-registrar-inventario',
  templateUrl: './registrar-inventario.component.html',
  styleUrl: './registrar-inventario.component.scss'
})
export class RegistrarInventarioComponent implements OnInit {
  public form: FormGroup;
  private referencia: ConsultarInventarioComponent;
  private idProducto: number = -1;
  public listaProductos: Producto[] = [];
  public productosFiltrados: Producto[] = [];
  public detalle: DetalleProducto;
  public esConsulta: boolean;
  public esRegistro: boolean;

  public formDesactivado: boolean;
  public columnas: string[] = ['fecha', 'producto', 'cantidad', 'tipoMovimiento', 'referencia'];
  public movimientosProducto: MovimientoProducto[] = [];
  public dataSourceMovimientosProducto = new MatTableDataSource(this.movimientosProducto);
  public tablaMovimientosDesactivada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarInventarioComponent;
      detalle: DetalleProducto;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      esRegistro: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.detalle = this.data.detalle;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
    this.esRegistro = this.data.esRegistro;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProductos();
    this.buscarMovimientosPorProducto(this.detalle.producto.id);
    this.filtrosSuscripciones();

    if (this.esConsulta && this.detalle) {
      this.rellenarFormularioDataDetalleProducto();
    }

    // Esto es necesario en el detalle unicamente para que el ID del producto se mantenga si no queres cambiarlo.
    if (this.detalle && this.detalle.producto) {
      this.idProducto = this.detalle.producto.id;
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txProducto: ['', [Validators.required]],
      txCantidadEnInventario: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      txValorEnInventario: [{value: '', disabled: true}],
      txBuscar: ['']
    });
  }

  private formatearValor(valor: number): string {
    return '$ ' + valor.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private rellenarFormularioDataDetalleProducto() {
    this.txProducto.setValue(this.detalle.producto.nombre);
    this.idProducto = this.detalle.producto.id;
    this.txCantidadEnInventario.setValue(this.detalle.cantEnInventario);

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  public habilitarEdicion(){
    this.form.enable();
    this.data.editar = true;
    this.formDesactivado = false;
    this.tablaMovimientosDesactivada = false;
    this.txValorEnInventario.disable();
  }

  /**
   * Valida que un campo mat-autocomplete sea un objeto válido dentro de
   * la lista de productos y no un string cualquiera.
   * @param productos Lista de productos a comparar
   */
  private esProductoValido(productos: Producto[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { productoInvalido: true };
      }
      const productoValido = productos.some(producto => producto.nombre === control.value);
      return productoValido ? null : { productoInvalido: true };
    };
  }

  private buscarProductos() {
    this.productoService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      this.listaProductos = productos;

      // Valida que el producto seleccionado sea un producto válido.
      this.txProducto.setValidators([Validators.required, this.esProductoValido(this.listaProductos)]);
      this.txProducto.updateValueAndValidity();

      this.txProducto.valueChanges.subscribe((producto) => {
        this.productosFiltrados = this.filterProductos(producto);
      });
    });
  }

  private buscarMovimientosPorProducto(idProducto: number) {
    this.productoService.consultarMovimientosPorProducto(idProducto).subscribe((movimientos) => {
      this.movimientosProducto = movimientos;
      this.dataSourceMovimientosProducto.data = this.movimientosProducto;
    });
  }

  public filterProductos(busqueda: string) {
    return this.listaProductos.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  public registrarDetalleProducto() {
    if (this.form.valid) {
      // Armamos el objeto Detalle Producto con todos los atributos
      const detalle: DetalleProducto = new DetalleProducto();
      detalle.idProducto = this.idProducto;
      detalle.cantEnInventario = this.txCantidadEnInventario.value;

      this.productoService.registrarDetalleProducto(detalle).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('El producto se registró con éxito en el inventario');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar un producto en inventario, intentelo nuevamente');
        }
      });
    }
  }

  public modificarDetalleProducto() {
    if (this.form.valid) {

      this.detalle.idProducto = this.idProducto;
      this.detalle.cantEnInventario = this.txCantidadEnInventario.value;

      this.productoService.modificarDetalleProducto(this.detalle).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Producto en inventario modificado con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar el producto en el inventario');
        }
      })
    }
  }

  private filtrosSuscripciones() {
    this.txCantidadEnInventario.valueChanges.subscribe((cantidad: number) => {
      if (this.detalle) { // Verificar si hay detalle
        const costo = this.detalle.producto.costo || 0;
        const valorEnInventario = cantidad * costo;

        // Formatear el valor usando toLocaleString para el formato argentino
        this.txValorEnInventario.setValue(this.formatearValor(valorEnInventario));
      }
    });

    this.form.get('txBuscar')?.valueChanges.subscribe((fechaSeleccionada: Date) => {
      if (fechaSeleccionada) {
        const fechaFiltrada = new Date(fechaSeleccionada);
        fechaFiltrada.setHours(0, 0, 0, 0);

        this.dataSourceMovimientosProducto.data = this.movimientosProducto.filter(movimiento => {
          const fechaMovimiento = new Date(movimiento.fecha);
          fechaMovimiento.setHours(0, 0, 0, 0);

          return fechaMovimiento.getTime() === fechaFiltrada.getTime();
        });
      } else {
        this.dataSourceMovimientosProducto.data = this.movimientosProducto;
      }
    });
  }

  public cancelar() {
    this.dialogRef.close();
  }

  /*
  * Método que se ejecuta cuando el usuario selecciona un producto de la lista
  * del mat-autocomplete. Guarda el id del producto seleccionado en la variable global.
   */
  public enSeleccionDeProducto(event: any) {
    this.idProducto = event.option.id;
  }

  // Region getters
  get txProducto(): FormControl {
    return this.form.get('txProducto') as FormControl;
  }

  get txCantidadEnInventario(): FormControl {
    return this.form.get('txCantidadEnInventario') as FormControl;
  }

  get txValorEnInventario(): FormControl {
    return this.form.get('txValorEnInventario') as FormControl;
  }

  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }
}
