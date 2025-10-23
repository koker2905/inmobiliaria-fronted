  import { Component,OnInit } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { ActivatedRoute } from '@angular/router';
  import { PropertyService } from '../../services/property.service';
  import { Property } from '../../models/property';

  @Component({
    selector: 'app-catalogo',
    imports: [FormsModule,CommonModule,RouterModule],
    templateUrl: './catalogo.component.html',
    styleUrl: './catalogo.component.css'
  })

  export class CatalogoComponent implements OnInit {
    properties: Property[] = [];
    filteredProperties: Property[] = [];

    // Variables que recibirán los parámetros
    propertyType: string = '';
    city: string = '';
    sector: string = '';
    estado: string = '';
    codigo: string = '';
    searchCode: string = '';
    cities: string[] = [];
    sectors: string[] = [];
    

    constructor(private route: ActivatedRoute, private propertyService: PropertyService) {}

    ngOnInit(): void {
      // Obtener los parámetros de la URL (cuando se navega desde la página principal)

        this.route.queryParams.subscribe(params => {
        this.propertyType = params['propertyType'] || '';
        this.city   = params['city'] || '';
        this.sector = params['sector'] || '';
        this.estado = params['estado'] || '';
        this.codigo = params['codigo'] || '';

        // Ahora cargamos los datos una vez que tenemos los filtros
    this.propertyService.getPropiedades().subscribe((data) => {
      this.properties = data.map(p => ({
        ...p,
        TipoPropiedad: p.TipoPropiedad?.toUpperCase().trim() || '',
        CIUDAD: p.CIUDAD?.toUpperCase().trim() || '',
        Direccion_Sector: this.limpiarTextoSector(p.Direccion_Sector || ''),
        IPD: p.IPD?.toUpperCase().trim() || '',
        PROCOD: (p.PROCOD || '').toUpperCase().trim(),
      }));

      this.cities = Array.from(new Set(this.properties.map(p => p.CIUDAD))).filter(c => !!c);

      if (this.city) {
        this.updateSectors(); // actualiza según la ciudad
      }

      this.filterProperties(); // 
        });
      });

    }

    filterProperties(): void {

      const filtroTipo = this.propertyType.toLowerCase().trim();
      const filtroEstado = this.estado.toLowerCase().trim();
      const filtroCiudad = this.city.toUpperCase().trim();
      const filtroSector = this.limpiarTextoSector(this.sector);
      const filtroCodigo = this.codigo.toLocaleLowerCase().trim();
      
        
      this.filteredProperties = this.properties.filter(property => {
        const tipo = property.TipoPropiedad?.toLowerCase().trim() || '';
        const ciudad = property.CIUDAD || '';
        const sector = this.limpiarTextoSector(property.Direccion_Sector || '');
        const precio = Number(property.Precio_Venta) || 0;
        const estado =  property.Estado?.toLowerCase().trim() || 0;
        const codigo = property.IPD.toLowerCase().trim() || 0;
        const tieneImagen = Array.isArray(property.imagenes) && property.imagenes.length > 0;
    
        const tipoMatch = this.propertyType ? tipo === filtroTipo : true;
        const estadoMatch = this.estado ? estado === filtroEstado : true;
        const codigoMatch = this.codigo ? codigo == filtroCodigo : true;
        const ciudadMatch = this.city ? ciudad === filtroCiudad : true;
        const sectorMatch = this.sector
          ? sector.includes(filtroSector) || filtroSector.includes(sector)
          : true;



    
        return tipoMatch && ciudadMatch && sectorMatch  && estadoMatch && codigoMatch && tieneImagen;
      });
    
      console.log('✅ Propiedades filtradas:', this.filteredProperties.length);
    }
    
    

          // Crear el enlace de WhatsApp con la información de la propiedad
          createWhatsappLink(property: Property): string {
            const message = `¡Hola! Me interesa la propiedad en ${property.TipoPropiedad} con el codigo${property.IPD}. Ubicada en el sector: ${property.Direccion_Sector}. `;
            return `https://wa.me/${+593998683511}?text=${encodeURIComponent(message)}`;
          }
        


    // Limpiar filtros
    clearFilters() {
      this.propertyType = '';
      this.city = '';
      this.sector = '';
      this.estado = '';
      this.codigo = '';
      this.filterProperties();
    }

    // Ver más detalles de una propiedad
    viewMore(property: Property) {
      console.log('Ver más detalles:', property);
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
      this.filterProperties();
    }
    onSectorChange(sector: string) {
      this.sector = sector;
      this.filterProperties();
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
  }

  