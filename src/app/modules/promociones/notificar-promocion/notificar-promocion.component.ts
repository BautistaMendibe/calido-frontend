import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PromocionesService } from "../../../services/promociones.service";
import { Router } from "@angular/router";
import { SnackBarService } from "../../../services/snack-bar.service";

@Component({
  selector: 'app-notificar-promocion',
  templateUrl: './notificar-promocion.component.html',
  styleUrls: ['./notificar-promocion.component.scss']
})
export class NotificarPromocionComponent implements OnInit {
  public form: FormGroup;
  public previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private promocionesService: PromocionesService,
    private router: Router,
    private notificacionService: SnackBarService,
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.crearFormulario();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2200)]],
      image: [null, Validators.required]
    });
  }

  private validateImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      this.notificacionService.openSnackBarError('El tipo de archivo no es válido. Solo se permiten archivos JPEG y PNG.');
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
      this.form.patchValue({ image: null });
      return;
    }

    this.form.patchValue({ image: file });
    this.form.get('image')!.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    this.handleFileInput(input.files[0]);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('dragover');

    const files = event.dataTransfer?.files;
    if (!files?.length) {
      return;
    }

    this.handleFileInput(files[0]);
  }

  async publicar() {
    if (this.form.valid) {
      const imageFile = this.form.get('image')!.value;
      const comment = this.form.get('comment')!.value;

      const base64Image = await this.convertImageToBase64(imageFile);
      const data = new URLSearchParams();
      data.append('comment', comment);
      data.append('image', base64Image);

      this.promocionesService.notificarPromocion(data.toString()).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La publicación se realizó con éxito');
        } else {
          this.notificacionService.openSnackBarError('Error al publicar la promoción, intentelo nuevamente');
        }
      })

    }
  }

  private convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
