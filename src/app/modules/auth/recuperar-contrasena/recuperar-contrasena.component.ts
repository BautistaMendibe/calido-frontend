import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UsuariosService} from "../../../services/usuarios.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {RecuperarContrasena} from "../../../models/RecuperarContrasena.model";

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.component.html',
  styleUrl: './recuperar-contrasena.component.scss'
})
export class RecuperarContrasenaComponent implements OnInit {
  public formRecuperar: FormGroup;
  public isLoading: boolean = true;
  public hidePassword: boolean = true;
  public hideConfirmPassword: boolean = true;
  public existeToken: boolean = false;
  public token: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private router: Router,
    private route: ActivatedRoute,
    private notificacionService: SnackBarService,
    private snackBarService: SnackBarService,
    private authService: AuthService
  ) {
    this.formRecuperar = new FormGroup({});
  }

  ngOnInit(){
    if (this.authService.isAuthenticated()) {
      this.authService.logOut();
    }

    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.existeToken = true;
        this.token = params['token'];
      }
    });

    this.crearFormularioRecuperar();
  }

  private crearFormularioRecuperar() {
    this.formRecuperar = this.formBuilder.group({
      txCorreo: ['', [Validators.required, this.emailValidator()]],
      txContrasena: [
        '',
        [
          //Validators.required,
          Validators.minLength(8),
          Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])/)
        ]
      ],
      txConfirmarContrasena: ['']
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  public enviarEnlace() {
    if (this.formRecuperar.valid) {
      const recuperarContrasena = new RecuperarContrasena();
      recuperarContrasena.correo = this.txCorreo.value;

      this.usuariosService.recuperarContrasena(recuperarContrasena).subscribe((respuesta) => {
        if (respuesta.mensaje === 'OK') {
          this.notificacionService.openSnackBarSuccess('Se envió un enlace de recuperación a tu correo electrónico.');
        } else {
          this.notificacionService.openSnackBarError('Error al generar enlace, contacta al administrador.');
        }
      }, (error) => {
        this.notificacionService.openSnackBarError('Error al generar enlace, contacta al administrador.');
      });
    }
  }

  public cambiarContrasena() {
    this.txCorreo.setValue('ejemplo@gmail.com');
    if (this.formRecuperar.valid) {
      const recuperarContrasena = new RecuperarContrasena();
      recuperarContrasena.token = this.token;
      recuperarContrasena.contrasena = this.txContrasena.value;

      this.usuariosService.cambiarContrasena(recuperarContrasena).subscribe((respuesta) => {
        if (respuesta.mensaje === 'OK') {
          this.notificacionService.openSnackBarSuccess('Contraseña cambiada correctamente.');
          this.router.navigate(['/login']);
        } else {
          this.notificacionService.openSnackBarError('El enlace de recuperación ha expirado, intenta nuevamente.');
        }
      }, (error) => {
        this.notificacionService.openSnackBarError('El enlace de recuperación ha expirado, intenta nuevamente.');

      });
    }
  }

  private emailValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
      const valid = emailPattern.test(control.value);
      return valid ? null : { invalidEmail: { value: control.value } };
    };
  }

  public passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('txContrasena');
    const confirmPassword = control.get('txConfirmarContrasena');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  public volver() {
    this.router.navigate(['/login']);
  }

  get txCorreo(): FormControl {
    return this.formRecuperar.get('txCorreo') as FormControl;
  }

  get txContrasena(): FormControl {
    return this.formRecuperar.get('txContrasena') as FormControl;
  }

  get txConfirmarContrasena(): FormControl {
    return this.formRecuperar.get('txConfirmarContrasena') as FormControl
  }
}
