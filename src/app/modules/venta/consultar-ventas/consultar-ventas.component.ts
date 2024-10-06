import { Component } from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Producto} from "../../../models/producto.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {MarcasService} from "../../../services/marcas.service";
import {ProveedoresService} from "../../../services/proveedores.service";
import {NotificationService} from "../../../services/notificacion.service";
import {ProductosService} from "../../../services/productos.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {Venta} from "../../../models/venta.model";
import {FiltrosVentas} from "../../../models/comandos/FiltrosVentas.comando";
import {VentasService} from "../../../services/ventas.services";
import {FormaDePago} from "../../../models/formaDePago.model";
import {TipoFactura} from "../../../models/tipoFactura.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-consultar-ventas',
  templateUrl: './consultar-ventas.component.html',
  styleUrl: './consultar-ventas.component.scss'
})
export class ConsultarVentasComponent {

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
  public form: FormGroup;
  private filtros: FiltrosVentas;
  public columnas: string[] = ['nroventa', 'montoTotal', 'fecha', 'formaDePago', 'productos', 'acciones'];

  public formasDePago: FormaDePago[] = [];
  public tiposFactura: TipoFactura[] = [];
  public ventas: Venta[] = [];
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private router: Router) {
    this.filtros = new FiltrosVentas();
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.crearForm();
    this.buscarFormasDePago();
    this.buscarTiposFactura();
    this.buscarVentas();
  }

  private crearForm() {
    this.form = this.fb.group({
      txNumero: [''],
      txFechaDesde: [''],
      txFechaHasta: [''],
      txFormaDePago: [''],
      txTiposFactura: [''],
    });
  }

  private buscarFormasDePago() {
    this.ventasService.buscarFormasDePago().subscribe((formasDePago) => {
      this.formasDePago = formasDePago;
    });
  }

  private buscarTiposFactura() {
    this.ventasService.buscarTiposFactura().subscribe((tiposFactura) => {
      this.tiposFactura = tiposFactura;
    });
  }

  private armarFiltro() {
    this.filtros.numero = this.txNumero.value;
    this.filtros.fechaDesde = this.txFechaDesde.value;
    this.filtros.fechaHasta = this.txFechaHasta.value;
    this.filtros.formaDePago = this.txFormaDePago.value;
    this.filtros.tipoFacturacion = this.txTiposFactura.value;
  }

  public buscarVentas() {
    this.isLoading = false;
    this.armarFiltro();
    this.ventasService.buscarVentas(this.filtros).subscribe((ventas) => {
      this.ventas = ventas;
      this.isLoading = false;
    })
  }

  public registrarNuevaVenta() {
    this.router.navigate(['/registrar-venta']);
  }

  public limpiarFiltros() {
    this.form.reset();
  }

  public verVenta() {

  }

  public deshacerVenta() {

  }

  // Getters
  get txNumero(): FormControl {
    return this.form.get('txNumero') as FormControl;
  }

  get txFechaDesde(): FormControl {
    return this.form.get('txFechaDesde') as FormControl;
  }

  get txFechaHasta(): FormControl {
    return this.form.get('txFechaHasta') as FormControl;
  }

  get txFormaDePago(): FormControl {
    return this.form.get('txFormaDePago') as FormControl;
  }

  get txTiposFactura(): FormControl {
    return this.form.get('txTiposFactura') as FormControl;
  }

}
