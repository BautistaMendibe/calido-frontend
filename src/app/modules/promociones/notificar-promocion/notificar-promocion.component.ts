import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PromocionesService } from "../../../services/promociones.service";
import { Router } from "@angular/router";
import { SnackBarService } from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";


@Component({
  selector: 'app-notificar-promocion',
  templateUrl: './notificar-promocion.component.html',
  styleUrls: ['./notificar-promocion.component.scss']
})
export class NotificarPromocionComponent implements OnInit {
  public form: FormGroup;
  public previewUrl: string | ArrayBuffer | null = null;
  private selectedFile: File | null = null;
  public isLoading = false;
  public showEmojiPicker = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private promocionesService: PromocionesService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService
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
    const validTypes = ['image/jpeg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      this.notificacionService.openSnackBarError('El tipo de archivo no es válido. Solo se permiten archivos JPEG.');
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
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.handleFileInput(this.selectedFile);
    }
  }

  async publicar() {
    if (this.form.valid && this.selectedFile) {

      const comentario = this.form.get('comment')!.value;
      const formData = new FormData();
      formData.append('imagen', this.selectedFile);
      formData.append('comentario', comentario);

      this.notificationDialogService.confirmation("¿Desea publicar la promoción?", "Publicar promoción")
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            this.isLoading = true;
            this.promocionesService.notificarPromocion(formData).subscribe({
              next: (respuesta) => {
                this.isLoading = false;

                if (respuesta.mensaje === 'OK') {
                  this.notificacionService.openSnackBarSuccess('La publicación se realizó con éxito');
                } else {
                  this.notificacionService.openSnackBarError('Error al publicar, intentelo nuevamente');
                }
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error al publicar:', error);
                this.notificacionService.openSnackBarError('Error al publicar, intentelo nuevamente');
              }
            });
          }
        });
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const commentControl = this.form.get('comment');
    commentControl?.setValue(commentControl?.value + event.emoji.native);
  }

}
