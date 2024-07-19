import {Component, Inject, OnInit} from '@angular/core';
import {Promocion} from "../../../models/promociones.model";
import {ConsultarPromocionesComponent} from "../consultar-promociones/consultar-promociones.component";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PromocionesService} from "../../../services/promociones.service";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Producto} from "../../../models/producto.model";

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

    this.crearFormulario();

    if (!this.edit) {
      this.deshabilitarFormulario();
    }

    this.buscarProductos();
  }

  private buscarProductos(){
    this.promocionesService.buscarProductos().subscribe((productos) => {
      this.listaProductos = productos;
      // TODO: Poner validador de estar en lista
      this.txProducto.valueChanges.subscribe((producto) => {
        this.productosFiltrados = this.filterProductos(producto);
      });
    });
  }

  filterProductos(busqueda: string) {
    return this.listaProductos.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  // Creamos el formulario con los datos de la promocion que pasamos como parametro
  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: [this.promocion.nombre, [Validators.required]],
      txPorcentajeDescuento: [this.promocion.porcentajeDescuento, [Validators.required]],
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
    const promocion: Promocion = new Promocion();

    promocion.id = this.promocion.id;
    promocion.nombre = this.txNombre.value;
    promocion.porcentajeDescuento = this.txPorcentajeDescuento.value;
    promocion.idProducto = this.txProducto.value;

    this.promocionesService.modificarPromocion(promocion).subscribe((res) => {
      if (res.mensaje == 'OK') {
        this.notificacionService.openSnackBarSuccess('Promoción moficada con éxito');
        this.dialogRef.close();
        this.referencia.buscar();
      } else {
        this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar la promoción');
      }
    });
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
