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

    if (this.detalle && this.detalle.producto) {
      this.idProducto = this.detalle.producto.id;
      this.buscarMovimientosPorProducto(this.detalle.producto.id);
    }

    this.filtrosSuscripciones();

    if (this.esConsulta && this.detalle) {
      this.rellenarFormularioDataDetalleProducto();
    }

    if (this.data.editar) {
      this.txProducto.disable();
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txProducto: ['', [Validators.required]],
      txCantidadEnInventario: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      txValorEnInventario: [{value: '', disabled: true}],
      txBuscarFecha: [''],
      txBuscarFechaHasta: [''],
      txBuscarTipo: ['']
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
    this.txProducto.disable();
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
    // Verificar si los form controls están inicializados antes de suscribirse a valueChanges
    if (this.txCantidadEnInventario) {
      this.txCantidadEnInventario.valueChanges.subscribe((cantidad: number) => {
        if (this.detalle) { // Verificar si hay detalle
          const costo = this.detalle.producto.costo || 0;
          const valorEnInventario = cantidad * costo;

          // Formatear el valor usando toLocaleString para el formato argentino
          this.txValorEnInventario.setValue(this.formatearValor(valorEnInventario));
        }
      });
    }

    if (this.txBuscarFecha || this.txBuscarFechaHasta) {
      const aplicarFiltros = () => {
        const fechaSeleccionada: Date = this.txBuscarFecha ? this.txBuscarFecha.value : null;
        const fechaHasta: Date = this.txBuscarFechaHasta ? this.txBuscarFechaHasta.value : null;

        this.dataSourceMovimientosProducto.data = this.movimientosProducto.filter(movimiento => {
          let coincideFecha = true;

          if (fechaSeleccionada) {
            const fechaFiltrada = new Date(fechaSeleccionada);
            fechaFiltrada.setHours(0, 0, 0, 0); // Normalizar hora

            const fechaMovimiento = new Date(movimiento.fecha);
            fechaMovimiento.setHours(0, 0, 0, 0); // Normalizar hora

            if (fechaHasta) {
              const fechaHastaFiltrada = new Date(fechaHasta);
              fechaHastaFiltrada.setHours(0, 0, 0, 0); // Normalizar hora

              // Filtrar por rango de fechas
              coincideFecha = fechaMovimiento.getTime() >= fechaFiltrada.getTime() &&
                fechaMovimiento.getTime() <= fechaHastaFiltrada.getTime();
            } else {
              // Filtrar por fecha exacta si no se especifica fechaHasta
              coincideFecha = fechaMovimiento.getTime() === fechaFiltrada.getTime();
            }
          }

          return coincideFecha;
        });
      };

      // Suscribir cambios en txBuscarFecha y txBuscarFechaHasta
      this.txBuscarFecha?.valueChanges.subscribe(() => {
        aplicarFiltros();
      });

      this.txBuscarFechaHasta?.valueChanges.subscribe(() => {
        aplicarFiltros();
      });
    }

    if (this.txBuscarTipo) {
      this.txBuscarTipo.valueChanges.subscribe((tipoSeleccionado: string) => {
        const aplicarFiltros = () => {
          const fechaSeleccionada: Date = this.txBuscarFecha ? this.txBuscarFecha.value : null;
          const fechaHasta: Date = this.txBuscarFechaHasta ? this.txBuscarFechaHasta.value : null;
          const tipoSeleccionado: string = this.txBuscarTipo ? this.txBuscarTipo.value : null;

          this.dataSourceMovimientosProducto.data = this.movimientosProducto.filter(movimiento => {
            let coincideFecha = true;
            let coincideTipo = true;

            // Filtrar por fecha o rango
            if (fechaSeleccionada) {
              const fechaFiltrada = new Date(fechaSeleccionada);
              fechaFiltrada.setHours(0, 0, 0, 0); // Normalizar hora

              const fechaMovimiento = new Date(movimiento.fecha);
              fechaMovimiento.setHours(0, 0, 0, 0); // Normalizar hora

              if (fechaHasta) {
                const fechaHastaFiltrada = new Date(fechaHasta);
                fechaHastaFiltrada.setHours(0, 0, 0, 0); // Normalizar hora

                // Filtrar por rango de fechas
                coincideFecha = fechaMovimiento.getTime() >= fechaFiltrada.getTime() &&
                  fechaMovimiento.getTime() <= fechaHastaFiltrada.getTime();
              } else {
                // Filtrar por fecha exacta si no se especifica fechaHasta
                coincideFecha = fechaMovimiento.getTime() === fechaFiltrada.getTime();
              }
            }

            // Filtrar por tipo (incluyendo búsqueda parcial)
            if (tipoSeleccionado) {
              coincideTipo = movimiento.tipoMovimiento.toLowerCase().includes(tipoSeleccionado.toLowerCase());
            }

            return coincideFecha && coincideTipo;
          });
        };

        this.txBuscarFecha?.valueChanges.subscribe(() => {
          aplicarFiltros();
        });

        this.txBuscarFechaHasta?.valueChanges.subscribe(() => {
          aplicarFiltros();
        });

        this.txBuscarTipo?.valueChanges.subscribe(() => {
          aplicarFiltros();
        });
      });
    }
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

  get txBuscarFecha(): FormControl {
    return this.form.get('txBuscarFecha') as FormControl;
  }

  get txBuscarTipo(): FormControl {
    return this.form.get('txBuscarTipo') as FormControl;
  }

  get txBuscarFechaHasta() {
    return this.form.get('txBuscarFechaHasta') as FormControl;
  }
}
