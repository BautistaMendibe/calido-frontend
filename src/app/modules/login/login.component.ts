import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UsuariosService} from "../../services/usuarios.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.servicie";
import {SnackBarService} from "../../services/snack-bar.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  public formLogin: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router,
    private snackBarService: SnackBarService) {
    this.formLogin = new FormGroup({});
  }

  ngOnInit(){
    this.crearFormularioLogin()
  }

  private crearFormularioLogin(){
    this.formLogin = this.formBuilder.group({
      txNombreUsuario: ['', [Validators.required]],
      txContrasena: ['', [Validators.required]],
    });
  }

  public iniciarSesion(){
    if (this.formLogin.valid) {
      const nombreUsuario = this.txNombreUsuario.value;
      const contrasena = this.txContrasena.value;

      this.usuariosService.validarInicioSesion(nombreUsuario, contrasena).subscribe((token) => {
        if (token != 'ERROR') {
          // Si el inicio de sesion es correcto guardamos el token del usuario en el localStore y lo dirigimos al home
          this.authService.setToken(token);
          this.authService.updateAuthenticationStatus(true);
          this.router.navigate(['/']);
        } else {
          this.snackBarService.openSnackBarError('Usuario y/o contrasena inválido');
        }
      })
    }
  }

  public registrarse(){}


  // Region getters
  get txNombreUsuario(): FormControl {
    return this.formLogin.get('txNombreUsuario') as FormControl;
  }

  get txContrasena(): FormControl {
    return this.formLogin.get('txContrasena') as FormControl;
  }

}
