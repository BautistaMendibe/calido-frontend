import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HealthService} from "../../services/health.service";
import {UsuariosService} from "../../services/usuarios.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  public formLogin: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService) {
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
    // Verificamos si existe el usuario
    if (this.formLogin.valid) {
      const nombreUsuario = this.txNombreUsuario.value;
      const contrasena = this.txContrasena.value;

      this.usuariosService.validarInicioSesion(nombreUsuario, contrasena).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          console.log(respuesta);
        } else {
          console.log(respuesta);
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
