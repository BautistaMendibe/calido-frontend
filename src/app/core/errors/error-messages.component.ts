import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-error-messages',
  templateUrl: './error-messages.component.html',
  styleUrls: ['./error-messages.component.scss']
})

/**
 * Componente para mostrar mensajes de error en controles de formulario.
 *
 * Uso:
 * <app-error-messages [control]="tuControl"></app-error-messages>
 *
 * - `control`: Especifica el control de formulario al que se aplican los mensajes de error.
 * - Admite mensajes de error personalizados definidos en el array `errorOrder` del componente.
 *
 */
export class ErrorMessagesComponent {
  @Input() control!: AbstractControl | null;

  errorOrder = [
    { key: 'required', message: () => 'Campo obligatorio.' },
    { key: 'maxlength', message: (error: any) => `La longitud máxima es de ${error?.requiredLength} caracteres.` },
    { key: 'minlength', message: (error: any) => `La longitud mínima es de ${error?.requiredLength} caracteres.` },
    {
      key: 'max',
      message: (error: any) =>
        error?.context === 'monetario'
          ? `El monto no puede exceder ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(error?.maxValue)}.`
          : `El texto excede el máximo permitido de ${error?.max} caracteres.`
    },
    {
      key: 'min',
      message: (error: any) =>
        error?.context === 'monetario'
          ? `El monto no puede ser menor a ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(error?.minValue)}.`
          : `El texto debe tener un mínimo de ${error?.min} caracteres.`
    },
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
    { key: 'invalidEmail', message: () => 'El email ingresado es inválido.' },
    {
      key: 'matDatepickerMin',
      message: (error: any) => {
        const minDate = new Date(error?.min); // Convierte a Date
        return `La fecha debe ser mayor o igual al ${minDate.toLocaleDateString('es-AR')}.`;
      }
    },
    {
      key: 'matDatepickerMax',
      message: (error: any) => {
        const minDate = new Date(error?.min); // Convierte a Date
        return `La fecha debe ser menor o igual al ${minDate.toLocaleDateString('es-AR')}.`;
      }
    },
    { key: 'montoMayorCero', message: () => 'El monto ingresado debe ser mayor a cero.' },
    { key: 'invalidProvince', message: () => 'La provincia ingresada no existe.' },
    { key: 'invalidLocality', message: () => 'La localidad ingresada no existe.' },
  ];
}
