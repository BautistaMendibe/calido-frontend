import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Componente que muestra mensajes de error para controles de formulario.
 * Se debe agregar este componente en el HTML del formulario para mostrar los mensajes de error.
 * Se puede agregar errores personalizados en el template.
 */
@Component({
  selector: 'app-error-messages',
  template: `
    <div *ngIf="control && control.errors && (control.dirty || control.touched)">
      <ng-container *ngFor="let error of errorOrder">
        <p *ngIf="control.hasError(error.key); else stop">
          {{ error.message(control.errors[error.key]) }}
        </p>
        <ng-template #stop></ng-template>
      </ng-container>
    </div>
  `,
  styles: [`
    p {
      color: indianred;
      font-size: 0.8em;
      margin-top: -20px;
      padding: 0;
    }
  `]
})
export class ErrorMessagesComponent {
  @Input() control!: AbstractControl | null;

  errorOrder = [
    { key: 'required', message: () => 'Campo obligatorio.' },
    { key: 'maxlength', message: (error: any) => `La longitud máxima es ${error?.requiredLength} caracteres.` },
    { key: 'minlength', message: (error: any) => `La longitud mínima es ${error?.requiredLength} caracteres.` },
    { key: 'max', message: (error: any) => `Valor máximo permitido: ${error?.max} caracteres.` },
    { key: 'min', message: (error: any) => `Valor mínimo permitido: ${error?.min} caracteres.` },
    { key: 'invalidDate', message: () => 'Fecha debe ser anterior a hoy.' },
    { key: 'fechaInvalida', message: () => 'Fecha debe ser anterior a hoy.' },
    { key: 'nullValidator', message: () => 'Este campo no debe estar vacío.' },
    { key: 'passwordRequired', message: () => 'La contraseña es obligatoria.' },
    { key: 'passwordMinLength', message: () => 'Debe contener mínimo 8 caracteres.' },
    { key: 'pattern', message: () => 'Formato incorrecto.' },
    { key: 'mask', message: () => `Formato incorrecto.` },
    { key: 'dniCuilMismatch', message: () => 'El DNI y el CUIL no coinciden.' },
    { key: 'horaInvalida', message: () => 'Hora salida debe ser mayor a hora entrada.' },
    { key: 'passwordMismatch', message: () => 'Las contraseñas no coinciden.' },
    { key: 'invalidPercentage', message: () => 'El porcentaje debe ser mayor a 0 y menor o igual a 100.' },
  ];
}


