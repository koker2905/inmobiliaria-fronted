import { Component, HostListener} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { Property } from '../app/models/property';
import { CommonModule } from '@angular/common'; 
import { LoginModalComponent } from './login-modal/login-modal.component'; 
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet,LoginModalComponent,CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'inmobiliariafenix';
  properties: Property[] = [];
  showLoginModal: boolean = false;
  isLoggedIn = false;

  constructor(private router: Router, private authService:AuthService) {

    this.authService.authState$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    
  } // Inyectando el router


  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.dropdown')) {
    this.dropdownAbierto = false;
  }
}


  // Métodos de navegación
  goToInicio(): void {
    this.router.navigateByUrl('/home');
  }

  goToAcercaDe(): void {
    this.router.navigateByUrl('/acercade');
  }

  goToMantenimiento(): void {
    this.router.navigateByUrl('/mantenimiento');
  }

  goToSeguimiento(): void {
    this.router.navigateByUrl('/seguimiento');
  }

    // Mostrar el modal de inicio de sesión
    openLoginModal() {
      console.log("Modal abierto");  // Agrega esta línea para verificar si la función es llamada
      this.showLoginModal = true;
    }
    
  
    // Cerrar el modal de inicio de sesión
    closeLoginModal() {
      this.showLoginModal = false;
    }

    cerrarSesion() {
      this.authService.logOut();
      this.router.navigateByUrl('/home');
    }

    dropdownAbierto = false;

    toggleDropdown() {
    this.dropdownAbierto = !this.dropdownAbierto;
    }

    filtrarPorTipo(tipo: string) {
      this.dropdownAbierto = false; // cerrar al seleccionar
      this.router.navigate(['/catalogo'], {
        queryParams: {
          propertyType: tipo
        }
      });
    }

}
