import { Component, AfterViewInit, ViewChild, ElementRef  } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property } from '../../models/property';
import { PropertyService } from '../../services/property.service';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-home',
  imports: [RouterOutlet, CommonModule,FormsModule, NgSelectModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Corregido a 'styleUrls' (con 's')
})
export class HomeComponent implements AfterViewInit {
  properties: Property[] = [];

  randomProperties: Property[] = [];

  showScrollUp: boolean = false;
  selectedFilter: string = 'venta';

  busquedaActiva: boolean = false;


  propertyTypes: string[] = [];


  accion: string = '';
  propertyType: string = '';  // Tipo de propiedad seleccionado
  city: string = '';    // Ciudad seleccionada
  sector: string = '';     // Sector seleccionado
  estado: string = 'En Venta'; 
  codigo: string = '';   

  cities: string[] = [];
  sectors: string[] = [];

  filteredProperties: any[] = []; // Propiedades filtradas
  imageRotationIntervals: { [key: string]: any } = {};

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(private propertyService: PropertyService, private router: Router) {} // Inyectando el router
  
  ngOnInit(): void {
    this.propertyService.getPropiedades().subscribe((properties) => {
      const propiedadesConImagenes = properties
        .filter(p => Array.isArray(p.imagenes) && p.imagenes.length > 0)
        .map(p => ({
          ...p,
          imagenActualIndex: 0
        }));
  
      this.randomProperties = this.getRandomProperties(propiedadesConImagenes, 9);
  
      this.properties = properties.map(p => ({
        ...p,
        TipoPropiedad: p.TipoPropiedad?.toUpperCase().trim() || '',
        CIUDAD: p.CIUDAD?.toUpperCase().trim() || '',

      }));

      console.log('📋 Todos los tipos de propiedad cargados (raw):');
this.properties.forEach(p => {
  console.log(`- [${p.TipoPropiedad}]`);
});



  
      this.cities = Array.from(new Set(this.properties.map(p => p.CIUDAD))).filter(c => !!c);
  
      this.propertyTypes = Array.from(
        new Set(this.properties.map(p => this.limpiarTextoTipo(p.TipoPropiedad)))
      ).filter(t => !!t);
      
  
      if (this.city) {
        this.updateSectors();
      }
    });
  }
  


  
  
  
  limpiarTextoSector(texto: string): string {
    return texto
      .toLowerCase()
      .replace(/\b(av\.?|avenida|sector|calle|c\.|cdla\.|urb\.?)\b/g, '')
      .replace(/[.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }


  limpiarTextoTipo(tipo: string): string {
    return tipo
      .toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
      .replace(/\(.*?\)/g, '')                         // remueve paréntesis con contenido
      .replace(/[0-9]+/g, '')                          // elimina números
      .replace(/M2|M²|M\^2/g, '')                      // elimina m2 variantes
      .replace(/[^A-Z\s]/g, '')                        // elimina símbolos raros
      .replace(/\s+/g, ' ')                            // reduce espacios
      .trim();
  }
  
  

  goToCatalogo(): void {
    this.router.navigateByUrl('/catalogo');
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

    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      this.videoPlayer.nativeElement.muted = true;
      this.videoPlayer.nativeElement.volume = 0;
    }
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
getRandomProperties(properties: any[], num: number): any[] {
  return this.shuffle(properties).slice(0, num);
}

// Función para mezclar el arreglo (algoritmo Fisher-Yates)
shuffle(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

   // Función para actualizar los sectores según la ciudad
   updateSectors() {
    const sectoresUnicos = this.properties
      .filter(p => p.CIUDAD === this.city.toUpperCase().trim())
      .map(p => p.Direccion_Sector)
      .filter((s, i, arr) => !!s && arr.indexOf(s) === i); // elimina duplicados exactos
  
    this.sectors = sectoresUnicos;
  }

    // Función que se llama cuando se cambia la ciudad
    onCityChange(city: string) {
      this.city = city;
      this.updateSectors();  // Actualiza los sectores cuando cambia la ciudad
    }
    onSectorChange(sector: string) {
      this.sector = sector;
    }

      // Crear el enlace de WhatsApp con la información de la propiedad
  createWhatsappLink(property: Property): string {

    const message = `¡Hola! Me interesa la propiedad en ${property.TipoPropiedad} con el codigo${property.IPD}. Ubicada en el sector: ${property.Direccion_Sector}. `;
    return `https://wa.me/${+593998683511}?text=${encodeURIComponent(message)}`;
  }


  searchProperties(): void {
    const tipoLimpio = (this.propertyType || '').toUpperCase().trim();
    const ciudadLimpia = (this.city || '').toUpperCase().trim();
    const estadoLimpio = (this.estado || '').toUpperCase().trim();
  
    this.busquedaActiva = true;
  
    this.filteredProperties = this.properties.filter(property => {
      const tipoPropiedadRaw = property.TipoPropiedad || '';
      const tipoPropiedadLimpio = this.limpiarTextoTipo(tipoPropiedadRaw);
      const tipoComparado = tipoPropiedadLimpio.replace(/\s+/g, '');
      const tipoBuscado = tipoLimpio.replace(/\s+/g, '');
  
      const ciudadOk = !ciudadLimpia || property.CIUDAD === ciudadLimpia;
      const estadoOk = !estadoLimpio || (property.Estado || '').toUpperCase().trim() === estadoLimpio;
  
      // Logs de depuración
 
      return (
        (!tipoLimpio || tipoComparado.includes(tipoBuscado)) &&
        ciudadOk &&
        estadoOk
      );
    });
  
    console.log('🔎 Buscando tipo:', tipoLimpio);
    console.log('✅ Resultados encontrados:', this.filteredProperties);
  
    setTimeout(() => this.scrollToSection('seccion-2'), 100);
  }
  
  
  
  
  
  
  searchPorCodigo(): void {
    const codigoLimpio = (this.codigo || '').toUpperCase().trim();
  
    this.busquedaActiva = true;
  
    this.filteredProperties = this.properties.filter(property => {
      const codigoPropiedad = (property.IPD || '').toUpperCase().trim();
      return codigoPropiedad === codigoLimpio;
    });
  
    console.log('🔍 Buscando código:', codigoLimpio);
    console.log('✅ Resultados por código:', this.filteredProperties);
  
    setTimeout(() => this.scrollToSection('seccion-2'), 100);
  }
  
  
  
  

  
  

    
}
