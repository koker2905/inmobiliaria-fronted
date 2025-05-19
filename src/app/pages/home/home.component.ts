import { Component, inject, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property } from '../../models/property';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Corregido a 'styleUrls' (con 's')
})
export class HomeComponent implements AfterViewInit {
  properties: Property[] = [];
  randomProperties: Property[] = []; 
  private authService = inject(AuthService);
  showScrollUp: boolean = false;



  accion: string = 'arrendar';
  propertyType: string = 'casa';  // Tipo de propiedad seleccionado
  location: string = 'cuenca';    // Ciudad seleccionada
  sector: string = 'sector1';     // Sector seleccionado

  propertiesi: any[] = [];        // Todas las propiedades
  filteredProperties: any[] = []; // Propiedades filtradas

  constructor(private propertyService: PropertyService, private router: Router) {} // Inyectando el router

  ngOnInit(): void {
    // Obtener propiedades desde el servicio y asignarlas a la variable 'properties'
    this.propertyService.getPropiedades().subscribe(
      (properties) => {
        this.randomProperties = this.getRandomProperties(properties, 9);
        console.log('Propiedades aleatorias:', this.randomProperties);
      },
      (error) => {
        console.error('Error al obtener propiedades aleatorias:', error);
      }
    );


  }



  
  // Métodos de navegación
  goToGestion(): void {
    this.router.navigateByUrl('/home-admin/espacios');
  }

  goToContratos(): void {
    this.router.navigateByUrl('/home-admin/contratos');
  }

  goToTarifas(): void {
    this.router.navigateByUrl('/home-admin/tarifas');
  }

  goToHorarios(): void {
    this.router.navigateByUrl('/home-admin/horarios');
  }

  goToGestionProfile(): void {
    this.router.navigateByUrl('/home-admin/perfiles');
  }

  goToIngreso(): void {
    this.router.navigateByUrl('/home-admin/ingreso');
  }

  goToCatalogo(): void {
    this.router.navigateByUrl('/catalogo');
  }

  goToHistorial(): void {
    this.router.navigateByUrl('/home-admin/historial');
  }

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

  // Método para hacer scroll hacia una sección
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Método para hacer scroll hacia arriba
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngAfterViewInit() {
    this.observeSection();
  }

  // Usamos IntersectionObserver para cambiar la dirección de la flecha cuando pasamos de la sección
  observeSection() {
    const section1 = document.getElementById('seccion-1');
    if (section1) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          console.log('IntersectionObserver entry:', entry); // Verificamos las entradas

          // Si la sección 1 está completamente visible, mostramos la flecha hacia abajo
          if (entry.isIntersecting) {
            console.log('Sección 1 visible: Flecha hacia abajo'); // Depuración
            this.showScrollUp = false;
          } else {
            console.log('Sección 1 no visible: Flecha hacia arriba'); // Depuración
            this.showScrollUp = true;
          }
        });
      }, { threshold: 1.0 });  // 1.0 significa que la sección debe estar completamente visible

      // Observar la sección
      observer.observe(section1);
    }
  }



    // Función para obtener propiedades aleatorias sin repeticiones
    getRandomProperties(properties: Property[], num: number): Property[] {
      // Mezclar el array de propiedades aleatoriamente (Fisher-Yates Shuffle)
      const shuffledProperties = this.shuffle(properties);
      // Devolver las primeras 'num' propiedades
      return shuffledProperties.slice(0, num);
    }
  
    // Función para mezclar el arreglo (Fisher-Yates Shuffle)
    shuffle(array: Property[]): Property[] {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambiar los elementos
      }
      return array;
    }

      // Crear el enlace de WhatsApp con la información de la propiedad
  createWhatsappLink(property: Property): string {
    const phoneNumber = '593998877665'; // El número de teléfono al que se enviará el mensaje (sin '+')
    const message = `¡Hola! Me interesa la propiedad en ${property.TipoPropiedad} con un precio de $${property.Precio_Venta}.`;
    return `https://wa.me/${+593963739789}?text=${encodeURIComponent(message)}`;
  }



  filterProperties(accionb : string){
    this.accion=accionb;
  }
  
    // Función de búsqueda basada en los filtros seleccionados
    searchProperties(): void {

      this.router.navigate(['/catalogo'], {
        queryParams: {
          propertyType: this.propertyType,
          city: this.location,
          sector: this.sector,
          action: this.accion
        }
      });
    }
      

  

}
