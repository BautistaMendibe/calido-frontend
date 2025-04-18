import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, Form, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Promocion} from "../../../models/promociones.model";
import {PromocionesService} from "../../../services/promociones.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Producto} from "../../../models/producto.model";
import {MatTableDataSource} from "@angular/material/table";
import {RegistrarProductoComponent} from "../../productos/registrar-producto/registrar-producto.component";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ThemeCalidoService} from "../../../services/theme.service";
import {ConsultarPromocionesComponent} from "../consultar-promociones/consultar-promociones.component";

@Component({
  selector: 'app-registrar-promocion',
  templateUrl: './registrar-promocion.component.html',
  styleUrl: './registrar-promocion.component.scss'
})
export class RegistrarPromocionComponent implements OnInit{

  public form: FormGroup;
  public listaProductos: Producto[] = [];
  public productosSelecionados: Producto[] = [];
  public productosSeleccionadosOriginales: Producto[] = [];
  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public columnas: string[] = ['seleccionar', 'imgProducto', 'nombre', 'precioConIVA'];
  public isLoading: boolean = false;
  public promocion: Promocion;
  public esConsulta: boolean;
  public fechaHoy: Date = new Date();
  public darkMode: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private promocionesService: PromocionesService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private themeService: ThemeCalidoService,
    @Inject(MAT_DIALOG_DATA) public data: {
      promocion: Promocion,
      esConsulta: boolean,
      referencia: ConsultarPromocionesComponent
    }
  ) {
    this.form = new FormGroup({});
    this.promocion = this.data.promocion;
    this.esConsulta = this.data.esConsulta;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();
    this.buscarProductos();
    this.suscripcionCierreDialogo();

    const filtro = { textoBusqueda: '' };

    // Filtrar por texto de búsqueda
    this.txBuscar.valueChanges.subscribe(valor => {
      filtro.textoBusqueda = valor.trim().toLowerCase();
      this.tableDataSource.filter = filtro.textoBusqueda;

      if (this.tableDataSource.paginator) {
        this.tableDataSource.paginator.firstPage();
      }
    });

    if (this.promocion) {
      this.setearDatos();
    }
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', [Validators.required]],
      txPorcentajeDescuento: ['',
        [
        Validators.required,
        this.validarPorcentaje(),
        Validators.pattern("^[0-9]*$")
        ]],
      txBuscar: ['', []],
      txFechaHasta: ['', []],
    });
  }

  private buscarProductos(){
    this.isLoading = true;
    this.promocionesService.buscarProductos().subscribe((productos) => {
      this.listaProductos = productos;

      if (this.promocion) {
        this.identificarYActualizarProductosSeleccionados();
      }

      this.tableDataSource.data = this.listaProductos;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;

      this.ordenarTablaPorSeleccionados();

      this.isLoading = false;
    });
  }

  private setearDatos() {
    this.txNombre.setValue(this.promocion.nombre);
    this.txPorcentajeDescuento.setValue(this.promocion.porcentajeDescuento);
    this.txFechaHasta.setValue(this.promocion.fechaHasta);
    this.productosSelecionados = this.promocion.productos;
    this.productosSeleccionadosOriginales = [...this.productosSelecionados];
    if (this.esConsulta) {
      this.form.disable();
    }
  }

  private identificarYActualizarProductosSeleccionados() {
    const productosSeleccionadosIds = this.productosSelecionados.map(p => p.id);
    this.listaProductos.forEach(producto => {
      if (productosSeleccionadosIds.includes(producto.id)) {
        producto.estaEnPromocion = true;
      }
    });
  }

  public validarPorcentaje(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      // Verifica si el valor es un número y está fuera de los límites
      if (value && (Number(value) <= 0 || Number(value) > 100)) {
        // Si el valor es menor o igual a 0 o mayor a 100, devuelve el error
        control.setValue(Math.max(1, Math.min(100, Number(value))));
        return { 'invalidPercentage': { value: control.value } };
      }

      return null;
    };
  }


  public seleccionarProducto(producto: Producto) {
    const index = this.productosSelecionados.findIndex(p => p.id === producto.id);
    if (index > -1) {
      this.productosSelecionados.splice(index, 1);
      producto.estaEnPromocion = false;
    } else {
      this.productosSelecionados.push(producto);
      producto.estaEnPromocion = true;
    }

    // Ordenar productos: primero los que están en promoción
    this.ordenarTablaPorSeleccionados();
  }

  private ordenarTablaPorSeleccionados() {
    const productosOrdenados = this.tableDataSource.data.sort((a, b) => {
      if (a.estaEnPromocion === b.estaEnPromocion) {
        return 0; // Si ambos tienen el mismo estado, no cambiar el orden
      }
      return a.estaEnPromocion ? -1 : 1; // a va antes que b si a está en promoción
    });

    // Actualizar la data de MatTableDataSource
    this.tableDataSource.data = productosOrdenados;
  }

  public registrarNuevoProducto() {
    const dialog = this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        panelClass: 'custom-dialog-container',
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    );

    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.buscarProductos();
      }
    })
  }

  public registrarPromocion() {

    if (this.form.valid) {

      if (this.productosSelecionados.length == 0) {
        this.notificacionService.openSnackBarError('Debe seleccionar al menos un producto para la promoción.');
        return;
      }

      const promocion: Promocion = new Promocion();
      promocion.nombre = this.txNombre.value;
      promocion.porcentajeDescuento = this.txPorcentajeDescuento.value;
      promocion.productos = this.productosSelecionados;

      if (this.txFechaHasta.value) {
        const fechaBase = new Date(this.txFechaHasta.value); // Fecha seleccionada
        promocion.fechaHasta = new Date(Date.UTC(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate(), 23, 59, 59, 999));
      } else {
        promocion.fechaHasta = null; // Si no hay fecha seleccionada
      }

      this.promocionesService.registrarPromocion(promocion).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La promoción se registró con éxito');
          this.dialogRef.close(true);
        } else {
          this.notificacionService.openSnackBarError('Error al registrar una promoción, intentelo nuevamente');
        }
      })

    }

  }

  public modificarPromocion() {
    if (this.form.valid) {
      if (this.productosSelecionados.length == 0) {
        this.notificacionService.openSnackBarError('Debe seleccionar al menos un producto para la promoción.');
        return;
      }

      const promocion: Promocion = new Promocion();
      promocion.id = this.promocion.id;
      promocion.nombre = this.txNombre.value;
      promocion.porcentajeDescuento = this.txPorcentajeDescuento.value;

      if (this.txFechaHasta.value) {
        const fechaBase = new Date(this.txFechaHasta.value); // Fecha seleccionada
        promocion.fechaHasta = new Date(Date.UTC(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate(), 23, 59, 59, 999));
      } else {
        promocion.fechaHasta = null; // Si no hay fecha seleccionada
      }

      const productosAgregados = this.productosSelecionados;
      promocion.productos = productosAgregados;

      promocion.productosEliminados = this.productosSeleccionadosOriginales.filter(producto =>
        !this.productosSelecionados.includes(producto)
      );

      this.promocionesService.modificarPromocion(promocion).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La promoción se modificó con éxito');
          this.dialogRef.close(true);
        } else {
          this.notificacionService.openSnackBarError('Error al modificar la promoción, intentelo nuevamente');
        }
      })
    }
  }

  public habilitarEdicion() {
    this.form.enable();
    this.esConsulta = !this.esConsulta;
  }

  public cancelar() {
    this.dialogRef.close();
    if (!this.esConsulta) {
      this.data.referencia.buscar();
    }
  }

  /**
   * Si el dialogo se cierra de forma no común (backdropClick) y
   * solo cuando no es consulta, se buscan las promociones de nuevo
   * @private
   */
  private suscripcionCierreDialogo() {
    this.dialogRef.backdropClick().subscribe((res) => {
      if (!this.esConsulta) {
        this.data.referencia.buscar();
      }
    });
  }

  // Region getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txPorcentajeDescuento(): FormControl {
    return this.form.get('txPorcentajeDescuento') as FormControl;
  }

  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }

  get txFechaHasta(): FormControl {
    return this.form.get('txFechaHasta') as FormControl;
  }

}
