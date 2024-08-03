import {Component, Inject, OnInit} from '@angular/core';
import {Promocion} from "../../../models/promociones.model";
import {ConsultarPromocionesComponent} from "../consultar-promociones/consultar-promociones.component";
import {FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PromocionesService} from "../../../services/promociones.service";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Producto} from "../../../models/producto.model";
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-detalle-promocion',
  templateUrl: './detalle-promocion.component.html',
  styleUrl: './detalle-promocion.component.scss'
})
export class DetallePromocionComponent implements OnInit {

  private promocion: Promocion;
  private referencia: ConsultarPromocionesComponent;
  public edit: boolean;
  public form: FormGroup;
  public listaProductos: Producto[] = [];
  public productosFiltrados: Producto[] = [];
  private idProductoSeleccionado: number = -1;

  constructor(
    public dialogRef: MatDialogRef<DetallePromocionComponent>,
    private fb: FormBuilder,
    private promocionesService: PromocionesService,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      promocion: Promocion,
      edit: boolean,
      referencia: ConsultarPromocionesComponent
    }
  ) {

    this.promocion = this.data.promocion;
    this.edit = this.data.edit;
    this.referencia = this.data.referencia;

    this.form = new FormGroup({});
  }

  ngOnInit() {

    this.buscarProductos();
    this.crearFormulario();

    if (!this.edit) {
      this.deshabilitarFormulario();
    }

    // Esto es necesario en el detalle unicamente para que el ID del producto se mantenga si no queres cambiarlo.
    this.idProductoSeleccionado = this.promocion.producto.id;

  }

  private buscarProductos(){
    this.promocionesService.buscarProductos().subscribe((productos) => {
      this.listaProductos = productos;

      // Valida que el producto seleccionado sea un producto válido.
      this.txProducto.setValidators([Validators.required, this.esProductoValido(this.listaProductos)]);
      this.txProducto.updateValueAndValidity();

      this.txProducto.valueChanges.subscribe((producto) => {
        this.productosFiltrados = this.filterProductos(producto);
        // Valida que el producto seleccionado sea un producto válido.
        this.txProducto.updateValueAndValidity();
      });
    });
  }

  filterProductos(busqueda: string) {
    return this.listaProductos.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  enSeleccionDeProducto(event: any) {
    this.idProductoSeleccionado = event.option.id;
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

  // Creamos el formulario con los datos de la promocion que pasamos como parametro
  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: [this.promocion.nombre, [Validators.required]],
      txPorcentajeDescuento: [this.promocion.porcentajeDescuento,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100),
          Validators.pattern("^[0-9]*$")
        ]],
      txProducto: [this.promocion.producto.nombre, [Validators.required]],
    });
  }

  public habilitarEdicion() {
    this.edit = true;
    this.habilitarFormulario();
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public modificarPromocion() {

    if (this.form.valid) {
      const promocion: Promocion = new Promocion();

      promocion.id = this.promocion.id;
      promocion.nombre = this.txNombre.value;
      promocion.porcentajeDescuento = this.txPorcentajeDescuento.value;
      promocion.idProducto = this.idProductoSeleccionado;

      this.promocionesService.modificarPromocion(promocion).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Promoción modificada con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar la promoción');
        }
      });
    }
  }

  private deshabilitarFormulario(){
    this.form.disable();
  }

  private habilitarFormulario() {
    this.form.enable();
  }

  // Region getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txPorcentajeDescuento(): FormControl {
    return this.form.get('txPorcentajeDescuento') as FormControl;
  }

  get txProducto(): FormControl {
    return this.form.get('txProducto') as FormControl;
  }

}
