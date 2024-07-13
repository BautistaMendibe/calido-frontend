import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Promocion} from "../../../models/promociones.model";
import {PromocionesService} from "../../../services/promociones.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarPromocionesComponent} from "../consultar-promociones/consultar-promociones.component";

@Component({
  selector: 'app-registrar-promocion',
  templateUrl: './registrar-promocion.component.html',
  styleUrl: './registrar-promocion.component.scss'
})
export class RegistrarPromocionComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarPromocionesComponent;

  constructor(
    private fb: FormBuilder,
    private promocionesService: PromocionesService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarPromocionesComponent
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.crearFormulario();
    //this.buscarProducto();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', [Validators.required]],
      txPorcentajeDescuento: ['', [Validators.required]],
      txProducto: ['', [Validators.required]],
    });
  }

  public registrarPromocion() {

    if (this.form.valid) {
      const promocion: Promocion = new Promocion();
      promocion.nombre = this.txNombre.value;
      promocion.porcentajeDescuento = this.txPorcentajeDescuento.value;
      promocion.idProducto = this.txProducto.value;


      this.promocionesService.registrarPromocion(promocion).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La promoción se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar una promoción, intentelo nuevamente');
        }
      })

    }

  }

  public cancelar() {
    this.dialogRef.close();
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
