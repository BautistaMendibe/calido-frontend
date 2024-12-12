import {Component, OnInit, ViewChild} from '@angular/core';
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
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {
  AsignarCuentaCorrienteComponent
} from "../../clientes/asignar-cuenta-corriente/asignar-cuenta-corriente.component";
import {FiltrosArqueos} from "../../../models/comandos/FiltrosArqueos.comando";
import {CajasService} from "../../../services/cajas.service";
import {Arqueo} from "../../../models/Arqueo.model";

@Component({
  selector: 'app-consultar-ventas',
  templateUrl: './consultar-ventas.component.html',
  styleUrl: './consultar-ventas.component.scss'
})
export class ConsultarVentasComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
  public form: FormGroup;
  private filtros: FiltrosVentas;
  public columnas: string[] = ['id', 'montoTotal', 'fecha', 'formaDePago', 'productos', 'acciones'];

  public formasDePago: FormaDePago[] = [];
  public tiposFactura: TipoFactura[] = [];
  public ventas: Venta[] = [];
  private arqueosHoy: Arqueo[] = [];

  public isLoading: boolean = false;
  public maxDate: Date;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private router: Router,
    private notificationDialogService: NotificationService,
    private cajasService: CajasService
  ){
    this.filtros = new FiltrosVentas();
    this.form = new FormGroup({});
    this.maxDate = new Date();
  }

  ngOnInit() {
    this.crearForm();
    this.buscarFormasDePago();
    this.buscarTiposFactura();
    this.buscarVentas();
    this.buscarArqueoCajaHoy();
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
      this.tableDataSource.data = this.ventas;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
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

  private buscarArqueoCajaHoy() {
    const filtro = new FiltrosArqueos();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    filtro.fechaApertura = hoy;

    this.cajasService.consultarArqueos(filtro).subscribe((arqueos) => {
      this.arqueosHoy = arqueos;
    });
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
          referencia: this,
        }
      }
    )
  }

  public anularVenta(venta: Venta, onSuccess?: () => void) {
    // Verifica si la caja de la venta que se desea anular está abierta
    if (!this.determinarArqueoCajaHoy(venta)) {
      this.notificacionService.openSnackBarError('La caja de esta venta no está abierta, intentelo nuevamente.');
      return;
    }

    // Condición para abrir el matDialog
    if (venta.comprobanteAfip.comprobante_nro && venta.cliente.id === -1) {
      // Abre el diálogo con el componente AsignarCuentaCorrienteComponent
      const dialogRef = this.dialog.open(AsignarCuentaCorrienteComponent, {
        width: '55%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          venta: venta,
          referencia: this,
        }
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        if (resultado) {
          this.notificacionService.openSnackBarSuccess('Venta anulada correctamente');
          this.buscarVentas();
          if (onSuccess) {
            onSuccess(); // Llama al callback solo si es exitoso
          }
        } else {
          if (resultado === false) {
            this.notificacionService.openSnackBarError('Error al anular venta. Intentelo nuevamente.');
          }
        }
      });
      return;
    }

    // Lógica normal si no se cumple la condición
    let mensajeTitulo: string = '';

    mensajeTitulo = venta.comprobanteAfip.comprobante_nro
      ? 'Generar nota de crédito'
      : 'Anular venta';

    const mensajeDescripcion: string = venta.comprobanteAfip.comprobante_nro
      ? `¿Desea generar una nota de crédito?
      Se añadirá balance positivo a la cuenta.`
      : `¿Desea anular esta venta?`;

    this.notificationDialogService.confirmation(mensajeDescripcion, mensajeTitulo)
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.ventasService.anularVenta(venta).subscribe((respuesta) => {
            if (respuesta.mensaje === 'OK') {
              this.notificacionService.openSnackBarSuccess('Venta anulada correctamente');
              this.buscarVentas();
              if (onSuccess) {
                onSuccess(); // Llama al callback solo si es exitoso
              }
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
    // Verifica si la caja de la venta que se desea facturar está abierta
    if (!this.determinarArqueoCajaHoy(venta)) {
      this.notificacionService.openSnackBarError('La caja de esta venta no está abierta, intentelo nuevamente.');
      return;
    }

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

  private determinarArqueoCajaHoy(venta: Venta): boolean {
    const arqueoConCaja = this.arqueosHoy.find((arqueo) => arqueo.idCaja === venta.idCaja);
    if (!arqueoConCaja || arqueoConCaja.idEstadoArqueo !== 1) {
      return false;
    }
    return true;
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
