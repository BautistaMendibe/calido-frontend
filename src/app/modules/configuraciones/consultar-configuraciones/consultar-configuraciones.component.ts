import {Component, OnInit} from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { SnackBarService } from "../../../services/snack-bar.service";
import {ConfiguracionesService} from "../../../services/configuraciones.service";
import {Configuracion} from "../../../models/configuracion.model";
import {NotificationService} from "../../../services/notificacion.service";
import {Usuario} from "../../../models/usuario.model";

@Component({
  selector: 'app-consultar-configuraciones',
  templateUrl: './consultar-configuraciones.component.html',
  styleUrl: './consultar-configuraciones.component.scss'
})
export class ConsultarConfiguracionesComponent implements OnInit {

  public form: FormGroup;
  public esSuperusuario: boolean = false;
  public configuracion: Configuracion = new Configuracion();
  public logoUrl: string | ArrayBuffer | null = null;
  private selectedFile: File | null = null;
  public isLoading = false;
  public isSearchingConfiguration: boolean = false;

  constructor(
    private fb: FormBuilder,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    private configuracionesService: ConfiguracionesService,
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.crearFormulario();
    this.isSearchingConfiguration = true;
    this.buscarConfiguracion();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      idUsuario: [{ value: '', disabled: true }],
      nombreUsuario: [{ value: '', disabled: true }],
      razonSocial: [''],
      calle: [''],
      numero: [''],
      ciudad: [''],
      provincia: [''],
      codigoPostal: [''],
      cuit: [''],
      fechaInicioActividades: [''],
      condicionIva: [''],
      logo: [null],
      contrasenaInstagram: [''],
      usuarioInstagram: ['']
    });
  }

  private buscarConfiguracion() {
    this.configuracionesService.consultarConfiguraciones().subscribe({
      next: (configuracion) => {
        this.configuracion = configuracion;
        this.isSearchingConfiguration = false;
        this.logoUrl = configuracion.logo;

        this.form.patchValue({
          idUsuario: configuracion.idUsuario,
          nombreUsuario: configuracion.usuario.nombreUsuario,
          razonSocial: configuracion.razonSocial,
          calle: configuracion.calle,
          numero: configuracion.numero,
          ciudad: configuracion.ciudad,
          provincia: configuracion.provincia,
          codigoPostal: configuracion.codigoPostal,
          cuit: configuracion.cuit,
          fechaInicioActividades: configuracion.fechaInicioActividades,
          condicionIva: configuracion.condicionIva,
          contrasenaInstagram: configuracion.contrasenaInstagram,
          logo: configuracion.logo,
          usuarioInstagram: configuracion.usuarioInstagram
        });
      },
      error: (err) => {
        console.error('Error al consultar la configuración:', err);
        this.isSearchingConfiguration = false;
        this.notificacionService.openSnackBarError('Error al cargar la configuración. Intente nuevamente.');
      }
    });
  }

  private validateImage(file: File): boolean {
    const validTypes = ['image/png', 'image/jpeg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      this.notificacionService.openSnackBarError('El tipo de archivo no es válido. Solo se permiten archivos PNG o JPG.');
      return false;
    }

    if (file.size > maxSize) {
      this.notificacionService.openSnackBarError('El tamaño del archivo es demasiado grande. El tamaño máximo permitido es de 10MB.');
      return false;
    }

    return true;
  }

  private handleFileInput(file: File) {
    if (!this.validateImage(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.logoUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.handleFileInput(this.selectedFile);
    }
  }

  // Método que se ejecuta al dar click al botón de guardar
  public guardarConfiguracion() {
    if (this.form.valid) {
      this.convertirLogoABase64((logoBase64) => {
        const configuracion = this.crearConfiguracionDesdeFormulario(logoBase64);
        this.actualizarConfiguracion(configuracion);
      });
    }
  }

  // Método que convierte el logo a base64 para guardarlo así en la tabla configuración
  private convertirLogoABase64(callback: (logoBase64: string | null) => void) {
    if (!this.selectedFile) {
      callback(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(this.selectedFile);
  }

  private crearConfiguracionDesdeFormulario(logoBase64: string | null): Configuracion {
    return new Configuracion(
      this.configuracion.id,
      this.configuracion.idUsuario,
      this.razonSocial.value,
      this.cuit.value,
      this.fechaInicioActividades.value,
      this.condicionIva.value,
      logoBase64,
      this.contrasenaInstagram.value,
      this.usuarioInstagram.value,
      this.configuracion.usuario = new Usuario(),
      this.calle.value,
      this.numero.value,
      this.ciudad.value,
      this.provincia.value,
      this.codigoPostal.value,
    );
  }

  private actualizarConfiguracion(configuracion: Configuracion) {
    this.notificationDialogService.confirmation("¿Desea modificar la configuración?", "Modificar configuración")
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.isLoading = true;
          this.configuracionesService.modificarConfiguracion(configuracion).subscribe({
            next: (respuesta) => {
              this.isLoading = false;

              if (respuesta.mensaje === 'OK') {
                this.notificacionService.openSnackBarSuccess('La configuración se modificó con éxito');
                window.location.reload();
              } else {
                this.notificacionService.openSnackBarError('Error al modificar la configuración, inténtelo nuevamente');
              }
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error al modificar la configuración:', error);
              this.notificacionService.openSnackBarError('Error al modificar la configuración, inténtelo nuevamente');
            }
          });
        }
      });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      this.previewImage(file);
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      this.logoUrl = reader.result;
    };

    reader.readAsDataURL(file);
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

  get calle(): FormControl {
    return this.form.get('calle') as FormControl;
  }

  get numero(): FormControl {
    return this.form.get('numero') as FormControl;
  }

  get ciudad(): FormControl {
    return this.form.get('ciudad') as FormControl;
  }

  get provincia(): FormControl {
    return this.form.get('provincia') as FormControl;
  }

  get codigoPostal(): FormControl {
    return this.form.get('codigoPostal') as FormControl;
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

  get usuarioInstagram(): FormControl {
    return this.form.get('usuarioInstagram') as FormControl;
  }

}
