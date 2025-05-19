import { Component,inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { Property } from '../app/models/property';
import { PropertyService } from '../app/services/property.service';
import { AuthService } from '../app/services/auth.service';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'inmobiliariafenix';
  properties: Property[] = [];
  private authService = inject(AuthService);

  constructor(private router: Router) {} // Inyectando el router



    // Función para login con Google
    loginWithGoogle() {
      this.authService.loginWithGoogle()
        .then(result => {
          console.log('Usuario logueado:', result.user);
          // Redirigir o realizar otra acción después de loguearse
        })
        .catch(error => {
          console.error('Error en login con Google:', error);
        });
    }



  // Métodos de navegación
  goToInicio(): void {
    this.router.navigateByUrl('/home');
  }

  goToAcercaDe(): void {
    this.router.navigateByUrl('/home-admin/espacios');
  }

}
