import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HealthService} from "../../services/health.service";
import {UsuariosService} from "../../services/usuarios.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  public formLogin: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private router: Router) {
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
          this.usuariosService.setToken(token);
          this.usuariosService.updateAuthenticationStatus(true);
          this.router.navigate(['/']);
        } else {
          console.log('usuario y/o contrasena invalido');
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
