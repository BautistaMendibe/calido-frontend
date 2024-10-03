import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {Tarjeta} from "../../../models/tarjeta.model";
import {FiltrosTarjetas} from "../../../models/comandos/FiltrosTarjetas.comando";
import {RegistrarTarjetaComponent} from "../registrar-tarjeta/registrar-tarjeta.component";
import {TarjetasService} from "../../../services/tarjetas.service";
import {TipoTarjeta} from "../../../models/tipoTarjeta.model";

@Component({
  selector: 'app-consultar-tarjetas',
  templateUrl: './consultar-tarjetas.component.html',
  styleUrl: './consultar-tarjetas.component.scss'
})
export class ConsultarTarjetasComponent implements OnInit {
  public tableDataSource: MatTableDataSource<Tarjeta> = new MatTableDataSource<Tarjeta>([]);
  public form: FormGroup;
  public tarjetas: Tarjeta[] = [];
  public columnas: string[] = ['imgTarjeta', 'tarjeta', 'tipoTarjeta', 'acciones'];
  private filtros: FiltrosTarjetas;
  public listaTarjetas: Tarjeta[] = [];
  public listaTiposTarjetas: TipoTarjeta[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();

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
    this.buscarTarjetas();
    this.buscarTiposTarjetas();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txProducto: [''],
      txProveedor: [''],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
  }

  public buscar() {
    this.filtros = {
      nombre: this.txTarjeta.value,
      tipoTarjeta: this.txTipoTarjeta.value,
    };
  }

  public registrarNuevaTarjeta() {
    this.dialog.open(
      RegistrarTarjetaComponent,
      {
        width: '75%',
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

  private buscarTarjetas() {
    this.tarjetasService.consultarTarjetas(this.filtros).subscribe((tarjetas) => {
      this.listaTarjetas = tarjetas;
    });
  }

  private buscarTiposTarjetas() {
    this.tarjetasService.buscarTiposTarjetas().subscribe((tiposTarjetas) => {
      this.listaTiposTarjetas = tiposTarjetas;
    });
  }

  get txTarjeta(): FormControl {
    return this.form.get('txTarjeta') as FormControl;
  }

  get txTipoTarjeta(): FormControl {
    return this.form.get('txTipoTarjeta') as FormControl;
  }
}
