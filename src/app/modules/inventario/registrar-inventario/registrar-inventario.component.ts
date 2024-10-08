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
  public formDesactivado: boolean;

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
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.detalle = this.data.detalle;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProductos();

    if (this.esConsulta && this.detalle) {
      this.rellenarFormularioDataDetalleProducto();
    }

    // Esto es necesario en el detalle unicamente para que el ID del producto se mantenga si no queres cambiarlo.
    this.idProducto = this.detalle.producto.id;
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txProducto: ['', [Validators.required]],
      txCantidadEnInventario: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
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

  public filterProductos(busqueda: string) {
    return this.listaProductos.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  public registrarDetalleProducto() {
    if (this.form.valid) {
      // Armamos el objeto Detalle Producto con todos los atributos
      const detalle: DetalleProducto = new DetalleProducto();
      detalle.idProducto = this.txProducto.value;
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
}
