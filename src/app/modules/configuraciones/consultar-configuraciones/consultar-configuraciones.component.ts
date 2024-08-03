import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackBarService } from "../../../services/snack-bar.service";

@Component({
  selector: 'app-consultar-configuraciones',
  templateUrl: './consultar-configuraciones.component.html',
  styleUrl: './consultar-configuraciones.component.scss'
})
export class ConsultarConfiguracionesComponent implements OnInit {

  public form: FormGroup;
  public logoUrl: string | ArrayBuffer;

  constructor(
    private fb: FormBuilder,
    private notificacionService: SnackBarService,
  ) {
    this.form = new FormGroup({});
    this.logoUrl = '';
  }

  ngOnInit() {
    this.crearFormulario();
    // TODO buscar datos de la configuracion
  }

  private crearFormulario() {
    this.form = this.fb.group({
      idUsuario: [{ value: '', disabled: true }],
      nombreUsuario: [{ value: '', disabled: true }],
      razonSocial: ['', [Validators.required]],
      domicilioComercial: ['', [Validators.required]],
      cuit: ['', [Validators.required, Validators.pattern("^[0-9]{2}-[0-9]{8}-[0-9]{1}$")]],
      fechaInicioActividades: ['', [Validators.required]],
      condicionIva: ['', [Validators.required]],
      logo: [null],
      contrasenaInstagram: ['', [Validators.required]]
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const reader = new FileReader();
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      reader.readAsDataURL(file);

      reader.onload = () => {
        if (reader.result) {
          this.logoUrl = reader.result as string;
          this.form.patchValue({
            logo: file
          });
        }
      };
    }
  }

  public guardarConfiguracion() {
    if (this.form.valid) {
      const formData = new FormData();
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          formData.append(key, control.value);
        }
      });

      // TODO guardar configuracion

    }
  }

  // Getters
  get idUsuario(): FormControl {
    return this.form.get('idUsuario') as FormControl;
  }

  get nombreUsuario(): FormControl {
    return this.form.get('nombreUsuario') as FormControl;
  }

  get razonSocial(): FormControl {
    return this.form.get('razonSocial') as FormControl;
  }

  get domicilioComercial(): FormControl {
    return this.form.get('domicilioComercial') as FormControl;
  }

  get cuit(): FormControl {
    return this.form.get('cuit') as FormControl;
  }

  get fechaInicioActividades(): FormControl {
    return this.form.get('fechaInicioActividades') as FormControl;
  }

  get condicionIva(): FormControl {
    return this.form.get('condicionIva') as FormControl;
  }

  get logo(): FormControl {
    return this.form.get('logo') as FormControl;
  }

  get contrasenaInstagram(): FormControl {
    return this.form.get('contrasenaInstagram') as FormControl;
  }

}
