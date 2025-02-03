import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {Tarjeta} from "../../../models/tarjeta.model";
import {FiltrosTarjetas} from "../../../models/comandos/FiltrosTarjetas.comando";
import {RegistrarTarjetaComponent} from "../registrar-tarjeta/registrar-tarjeta.component";
import {TarjetasService} from "../../../services/tarjetas.service";
import {TipoTarjeta} from "../../../models/tipoTarjeta.model";
import {CuotaPorTarjeta} from "../../../models/cuotaPorTarjeta.model";
import {Cuota} from "../../../models/Cuota.model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-consultar-tarjetas',
  templateUrl: './consultar-tarjetas.component.html',
  styleUrl: './consultar-tarjetas.component.scss'
})
export class ConsultarTarjetasComponent implements OnInit {
  public tableDataSource: MatTableDataSource<Tarjeta> = new MatTableDataSource<Tarjeta>([]);
  public form: FormGroup;
  public tarjetas: Tarjeta[] = [];
  public columnas: string[] = ['nombre', 'tipoTarjeta', 'cuotas', 'acciones'];
  private filtros: FiltrosTarjetas;
  public listaTiposTarjetas: TipoTarjeta[] = [];
  public listaCuotas: Cuota[] = [];
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private tarjetasService: TarjetasService,
    private notificationDialogService: NotificationService) {
    this.form = this.fb.group({
      txTarjeta: [''],
      txTipoTarjeta: [''],
    });
    this.filtros = new FiltrosTarjetas();
  }

  ngOnInit() {
    this.createForm();
    this.buscarTiposTarjetas();
    this.buscarCuotas();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txTarjeta: [''],
      txTipoTarjeta: [''],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros = {
      nombre: this.txTarjeta.value,
      tipoTarjeta: this.txTipoTarjeta.value,
    };

    this.isLoading = true;
    this.tarjetasService.consultarTarjetas(this.filtros).subscribe((tarjetas) => {
      this.tarjetas = tarjetas;
      this.tableDataSource.data = this.tarjetas;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      this.isLoading = false;
    });
  }

  public registrarNuevaTarjeta() {
    this.dialog.open(
      RegistrarTarjetaComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        height: 'auto',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    );
  }


  public verTarjeta(tarjeta: Tarjeta, editar: boolean) {
    this.dialog.open(
      RegistrarTarjetaComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        height: 'auto',
        autoFocus: false,
        data: {
          tarjeta: tarjeta,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    );
  }

  public eliminarTarjeta(idTarjeta: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar la tarjeta?', 'Eliminar tarjeta')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.tarjetasService.eliminarTarjeta(idTarjeta).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Tarjeta eliminada con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar la tarjeta');
            }
          });
        }
      });
  }

  private buscarTiposTarjetas() {
    this.tarjetasService.buscarTiposTarjetas().subscribe((tiposTarjetas) => {
      this.listaTiposTarjetas = tiposTarjetas;
    });
  }

  private buscarCuotas() {
    this.tarjetasService.buscarCuotas().subscribe((cuotas) => {
      this.listaCuotas = cuotas;
    });
  }

  public getCuotas(cuotaPorTarjeta: CuotaPorTarjeta[]) {
    return cuotaPorTarjeta
      .map(item => this.listaCuotas.find(cuota => cuota.id === item.idCuota)?.cantidadCuotas || 'Sin Cuotas')
      // Eliminar duplicados
      .filter((value, index, self) => self.indexOf(value) === index)
      // Ordenar de menor a mayor
      .sort((a, b) => {
        const aNum = a === 'Sin Cuotas' ? Infinity : Number(a);
        const bNum = b === 'Sin Cuotas' ? Infinity : Number(b);
        return aNum - bNum;
      })
      .join(', ');
  }

  // Región getters
  get txTarjeta(): FormControl {
    return this.form.get('txTarjeta') as FormControl;
  }

  get txTipoTarjeta(): FormControl {
    return this.form.get('txTipoTarjeta') as FormControl;
  }
  // end region
}
