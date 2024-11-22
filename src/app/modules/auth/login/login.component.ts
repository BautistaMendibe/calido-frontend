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
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConfiguracionesService} from "../../../services/configuraciones.service";
import {Usuario} from "../../../models/usuario.model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  public formLogin: FormGroup;
  public existeConfiguracion: boolean = false;
  public isLoading: boolean = true;
  public isValidatingPassword: boolean = false;
  public hidePassword: boolean = true;
  public hideConfirmPassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private configuracionesService: ConfiguracionesService,
    private router: Router,
    private snackBarService: SnackBarService) {
    this.formLogin = new FormGroup({});
  }

  ngOnInit(){
    this.existeSuperusuario(); // Verifica la existencia de la fila configuración
  }

  private existeSuperusuario() {
    this.configuracionesService.existeConfiguracion().subscribe({
      next: (resultado: boolean) => {
        this.isLoading = false;
        this.existeConfiguracion = resultado;
        // Crea un formulario u otro en función si el superusuario existe o no.
        this.existeConfiguracion ? this.crearFormularioLogin() : this.crearFormularioRegister();
      },
      error: (error) => {
        console.error('Error al verificar la existencia de superusuario:', error);
        this.isLoading = false;
      }
    });
  }

  private crearFormularioLogin(){
    this.formLogin = this.formBuilder.group({
      txNombreUsuario: ['', [Validators.required]],
      txContrasena: ['', [Validators.required]],
    });
  }

  private crearFormularioRegister() {
    this.formLogin = this.formBuilder.group({
      txNombreUsuario: ['', [Validators.required]],
      txContrasena: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])/)]],
      txNombre: ['', [Validators.required]],
      txApellido: ['', [Validators.required]],
      txConfirmarContrasena: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator.bind(this) });
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

  public iniciarSesion(){
    if (this.formLogin.valid && this.existeConfiguracion) {
      const nombreUsuario = this.txNombreUsuario.value;
      const contrasena = this.txContrasena.value;
      this.isValidatingPassword = true;

      this.usuariosService.validarInicioSesion(nombreUsuario, contrasena).subscribe((token) => {
        if (token != 'ERROR') {
          // Si el inicio de sesion es correcto guardamos el token del usuario en el localStore y lo dirigimos al home
          this.authService.setToken(token);
          this.authService.updateAuthenticationStatus(true);
          this.isValidatingPassword = false;
          this.router.navigate(['/']);
        } else {
          this.snackBarService.openSnackBarError('Usuario y/o contraseña inválido');
          this.isValidatingPassword = false;
        }
      })
    }
  }

  public registrarse() {
    if (this.formLogin.valid && !this.existeConfiguracion) {

      this.isValidatingPassword = true;

      // No existe fila configuración, tenemos que registrar el superusuario.
      const superusuario = new Usuario();
      superusuario.id = 1; // El superusuario siempre debería ser el primero en registrarse
      superusuario.nombreUsuario = this.txNombreUsuario.value;
      superusuario.nombre = this.txNombre.value;
      superusuario.apellido = this.txApellido.value;
      superusuario.contrasena = this.txContrasena.value;

      this.usuariosService.registrarSuperusuario(superusuario).subscribe({
        next: (resultadoUsuario) => {
          if (resultadoUsuario.mensaje == 'OK') {
            this.configuracionesService.registrarConfiguracion().subscribe({
              next: (resultadoConfiguracion) => {
                if (resultadoConfiguracion.mensaje == 'OK') {
                  this.snackBarService.openSnackBarSuccess('Usuario registrado exitosamente. Por favor, inicia sesión.');
                  this.txNombreUsuario.setValue('');
                  this.txContrasena.setValue('');
                  this.existeConfiguracion = true;
                  this.isValidatingPassword = false;
                } else {
                  this.snackBarService.openSnackBarError('Error al registrar usuario, contacta un administrador.');
                  this.isValidatingPassword = false;
                }
              },
              error: () => {
                this.snackBarService.openSnackBarError('Error al registrar usuario, contacta un administrador.');
                this.isValidatingPassword = false;
              }
            });
          } else {
            this.snackBarService.openSnackBarError('Error al registrar el usuario, contacta un administrador.');
            this.isValidatingPassword = false;
          }
        },
        error: () => {
          this.snackBarService.openSnackBarError('Error al registrar el usuario, contacta un administrador.');
          this.isValidatingPassword = false;
        }
      });
    }
  }

  public cambiarContrasena() {
    this.router.navigate(['/recuperar-contrasena'])
  }

  // Region getters
  get txNombreUsuario(): FormControl {
    return this.formLogin.get('txNombreUsuario') as FormControl;
  }

  get txNombre(): FormControl {
    return this.formLogin.get('txNombre') as FormControl;
  }

  get txApellido(): FormControl {
    return this.formLogin.get('txApellido') as FormControl;
  }

  get txContrasena(): FormControl {
    return this.formLogin.get('txContrasena') as FormControl;
  }

  get txConfirmarContrasena(): FormControl {
    return this.formLogin.get('txConfirmarContrasena') as FormControl
  }
  // endregion
}
