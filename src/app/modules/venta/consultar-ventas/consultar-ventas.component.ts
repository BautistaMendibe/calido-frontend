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
  public columnas: string[] = ['id', 'cliente', 'montoTotal', 'fecha', 'formaDePago', 'productos', 'acciones'];

  public formasDePago: FormaDePago[] = [];
  public tiposFactura: TipoFactura[] = [];
  public ventas: Venta[] = [];
  private arqueosHoy: Arqueo[] = [];

  public isLoading: boolean = false;
  public maxDate: Date;

  public cargadosOffsets: Set<number> = new Set();
  public totalDeVentas!: number;

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
    this.buscarVentasPaginado(0, 10);
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

  public buscarVentasPaginado(offset: number, limit: number, reset: boolean = false) {
    // Si se desea resetear los datos, limpiar las ventas y los offsets cargados
    if (reset) {
      this.ventas = []; // Limpiar las ventas
      this.cargadosOffsets.clear(); // Limpiar los offsets cargados
    }

    // Asignación de filtros
    this.filtros.numero = this.txNumero.value;
    this.filtros.fechaDesde = this.txFechaDesde.value;
    this.filtros.fechaHasta = this.txFechaHasta.value;
    this.filtros.formaDePago = this.txFormaDePago.value;
    this.filtros.tipoFacturacion = this.txTiposFactura.value;
    this.filtros.limit = limit;
    this.filtros.offset = offset;

    // Salir si ya se cargaron las ventas para este offset
    if (this.cargadosOffsets.has(offset)) {
      return;
    }

    this.isLoading = true;

    this.ventasService.buscarVentasPaginadas(this.filtros).subscribe((ventas) => {
      const totalDeVentas = ventas[0]?.totalDeVentas;

      if (offset === 0) {
        // Si es la primer página, completar con null hasta el totalDeVentas (se hace por bug del paginator)
        const diferencia = totalDeVentas - ventas.length;
        this.ventas = [...ventas, ...new Array(diferencia).fill(null)];
      } else {
        // Reemplazar los valores null por las nuevas ventas
        const nullIndex = this.ventas.findIndex(v => v === null);
        if (nullIndex !== -1) {
          this.ventas.splice(nullIndex, ventas.length, ...ventas);
        } else {
          this.ventas = [...this.ventas, ...ventas];
        }
      }

      // Actualizar el total de ventas
      this.totalDeVentas = totalDeVentas;

      // Marca el offset como cargado (para no buscar offsets ya cargados)
      this.cargadosOffsets.add(offset);

      // Asigna los datos a la tabla
      this.tableDataSource.data = this.ventas;
      this.tableDataSource.sort = this.sort;
      this.tableDataSource.paginator = this.paginator;

      this.isLoading = false;
    }, error => {
      this.isLoading = false;
    });
  }

  /**
   * Listener para cambios de pagina
   */
  public onPageChange(event: any) {
    const offset = event.pageIndex * event.pageSize;
    const limit = event.pageSize;
    this.buscarVentasPaginado(offset, limit);
  }

  public registrarNuevaVenta() {
    this.router.navigate(['/registrar-venta']);
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscarVentasPaginado(0, 10, true);
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
          esAnulacion: false
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

    // Si no tiene facturacion, se anula de forma logica y completa.
    if (!venta.comprobanteAfip.comprobante_pdf_url) {
      this.notificationDialogService.confirmation(`¿Desea anular esta venta?
      Se anulará de forma completa.`, 'Anular venta')
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            this.ventasService.anularVentaSinFacturacion(venta).subscribe((respuesta) => {
              if (respuesta.mensaje === 'OK') {
                this.notificacionService.openSnackBarSuccess('Venta anulada correctamente');
                this.buscarVentasPaginado(0, 10, true);
              } else {
                this.notificacionService.openSnackBarError('Error al anular venta. Intentelo nuevamente.');
              }
            });
          }
        });
    } else {
      const dialogAnular = this.dialog.open(
        DetalleVentaComponent,
        {
          width: '95%',
          autoFocus: false,
          height: '90vh',
          panelClass: 'custom-dialog-container',
          data: {
            venta: venta,
            esAnulacion: true
          }
        }
      );

      dialogAnular.afterClosed().subscribe((res) => {
        if (res) {
          this.buscarVentasPaginado(0, 10, true);
        }
      });
    }
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
              this.buscarVentasPaginado(0, 10, true);
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
