import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Promocion} from "../../../models/promociones.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {RegistrarPromocionComponent} from "../registrar-promocion/registrar-promocion.component";
import {FiltrosPromociones} from "../../../models/comandos/FiltrosPromociones.comando";
import {PromocionesService} from "../../../services/promociones.service";
import {Router} from "@angular/router";
import {DetallePromocionComponent} from "../detalle-promocion/detalle-promocion.component";
import {MessagesComponent} from "../../../shared/messages/messages.component";
import {NotificationService} from "../../../services/notificacion.service";
import {SnackBarService} from "../../../services/snack-bar.service";

@Component({
  selector: 'app-consultar-promociones',
  templateUrl: './consultar-promociones.component.html',
  styleUrl: './consultar-promociones.component.scss'
})
export class ConsultarPromocionesComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Promocion> = new MatTableDataSource<Promocion>([]);
  public form: FormGroup;
  public promociones: Promocion[] = [];
  public columnas: string[] = ['nombre', 'porcentajeDescuento', 'producto', 'acciones'];
  private filtros: FiltrosPromociones;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private promocionesService: PromocionesService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosPromociones();
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.nombre = this.txNombre.value;

    this.promocionesService.consultarPromociones(this.filtros).subscribe((promociones) => {
      this.promociones = promociones;
      this.tableDataSource.data = promociones;
    });
  }

  public registrarNuevaPromocion() {
    this.dialog.open(
      RegistrarPromocionComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          referencia: this
        }
      }
    )
  }


  public verPromocion(promocion: Promocion, editar: boolean) {
    this.dialog.open(
      DetallePromocionComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          promocion: promocion,
          edit: editar,
          referencia: this
        }
      }
    )
  }


  public eliminarPromocion(idPromocion: number) {

    this.notificationDialogService.confirmation("¿Desea eliminar la promoción?", "Eliminar promoción")
      .afterClosed()
      .subscribe((value) => {
      if (value) {
        this.promocionesService.eliminarPromocion(idPromocion).subscribe((respuesta) => {
          if (respuesta.mensaje == 'OK') {
            this.notificacionService.openSnackBarSuccess('Promoción eliminada con éxito');
            this.buscar();
          } else {
            this.notificacionService.openSnackBarError('Error al eliminar la promoción');
          }
        });
      }
    });
  }


  // Region getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

}
