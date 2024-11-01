import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Producto} from "../../../models/producto.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Venta} from "../../../models/venta.model";
import {FiltrosVentas} from "../../../models/comandos/FiltrosVentas.comando";
import {VentasService} from "../../../services/ventas.services";
import {FormaDePago} from "../../../models/formaDePago.model";
import {TipoFactura} from "../../../models/tipoFactura.model";
import {Router} from "@angular/router";
import {DetalleVentaComponent} from "../detalle-venta/detalle-venta.component";
import {RegistrarProductoComponent} from "../../productos/registrar-producto/registrar-producto.component";
import {NotificationService} from "../../../services/notificacion.service";

@Component({
  selector: 'app-consultar-ventas',
  templateUrl: './consultar-ventas.component.html',
  styleUrl: './consultar-ventas.component.scss'
})
export class ConsultarVentasComponent implements OnInit{

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
    private router: Router,
    private notificationDialogService: NotificationService) {
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
    this.isLoading = true;
    this.armarFiltro();
    this.ventasService.buscarVentas(this.filtros).subscribe((ventas) => {
      this.ventas = ventas;
      this.tableDataSource.data = ventas;
      this.isLoading = false;
    })
  }

  public registrarNuevaVenta() {
    this.router.navigate(['/registrar-venta']);
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscarVentas();
  }

  public verVenta(venta: Venta) {
    this.dialog.open(
      DetalleVentaComponent,
      {
        width: '75%',
        autoFocus: false,
        height: '85vh',
        panelClass: 'custom-dialog-container',
        data: {
          venta: venta,
        }
      }
    )
  }

  public anularVenta(venta: Venta) {
    this.notificationDialogService.confirmation('¿Desea anular esta venta?', 'Generar nota de crédito')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.ventasService.anularVenta(venta).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Venta anulada correctamente');
              this.buscarVentas();
            } else {
              this.notificacionService.openSnackBarError('Error al anular venta. Intentelo nuevamente.');
            }
          });
        }
      });
  }

  public imprimirComprobante(venta: Venta) {
    const url = venta.comprobanteAfip.comprobante_pdf_url;
    window.open(url, '_blank');
  }

  public getNombresProductos(productos: Producto[]): string {
    return productos.map(producto => producto.nombre).join(', ');
  }

  public verProducto(producto: Producto) {
    this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '80%',
        autoFocus: false,
        height: '85vh',
        panelClass: 'custom-dialog-container',
        data: {
          producto: producto,
          esConsulta: true,
          formDesactivado: true,
          editar: false
        }
      }
    );
  }

  public facturarVenta(venta: Venta) {
    this.notificationDialogService.confirmation('¿Desea facturar esta venta?', 'Facturar venta')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.ventasService.facturarVentaConAfip(venta).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Venta facturada correctamente');
              this.buscarVentas();
            } else {
              this.notificacionService.openSnackBarError('Error al facturar venta. Intentelo nuevamente.');
            }
          });
        }
      });
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
