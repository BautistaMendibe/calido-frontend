import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HealthService} from "../../services/health.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  public formLogin: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private healthService: HealthService) {
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
      this.healthService.getStatusBackend().subscribe((res) => {
        console.log(res);
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
