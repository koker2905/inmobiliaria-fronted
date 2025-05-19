import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule,CommonModule],
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
  action: string = '';
  minPrice: number = 0;
  maxPrice: number = 0;
  searchCode: string = '';

  cities: { [key: string]: string[] } = {
    Cuenca: ['Totoracocha', 'Monay', 'Calderon'],
    Azogues: ['Carcel', 'Charasol']
  };
  

  sectors: string[] = [];  // Sectores a mostrar según la ciudad seleccionada


  constructor(private route: ActivatedRoute, private propertyService: PropertyService) {}

  ngOnInit(): void {
    // Obtener los parámetros de la URL (cuando se navega desde la página principal)
    this.route.queryParams.subscribe(params => {
      this.propertyType = params['propertyType'] || '';
      this.city = params['city'] || '';
      this.sector = params['sector'] || '';
      this.action = params['action'] || '';

      // Llamar a la función de filtrado cuando se reciben los parámetros
      this.filterProperties();
      this.updateSectors();
    });

    // Obtener todas las propiedades y aplicar los filtros
    this.propertyService.getPropiedades().subscribe((data) => {
      this.properties = data;
      this.filterProperties();  // Aplicar los filtros a las propiedades
    });
  }

  // Función para filtrar las propiedades según los filtros
  filterProperties(): void {
    this.filteredProperties = this.properties.filter(property => {
      return (
        (this.propertyType ? property.TipoPropiedad.toLowerCase() === this.propertyType.toLowerCase() : true) &&
        (this.city ? property.Direccion_Sector.toLowerCase() === this.city.toLowerCase() : true) 

      );
    });
  }

  // Función para buscar por código de propiedad
  // searchByCode() {
  //   this.filteredProperties = this.properties.filter(property => 
  //     property.includes(this.searchCode)
  //   );
  // }

  // Limpiar filtros
  clearFilters() {
    this.propertyType = '';
    this.city = '';
    this.sector = '';
    this.action = '';
    this.minPrice = 0;
    this.maxPrice = 0;
    this.searchCode = '';
    this.filterProperties();
  }

  // Ver más detalles de una propiedad
  viewMore(property: Property) {
    console.log('Ver más detalles:', property);
  }



  //

  
  // Función para actualizar los sectores según la ciudad
  updateSectors() {
    this.sectors = this.cities[this.city] || [];  // Actualiza los sectores basados en la ciudad seleccionada
  }

  // Función que se llama cuando se cambia la ciudad
  onCityChange(city: string) {
    this.city = city;
    this.updateSectors();  // Actualiza los sectores cuando cambia la ciudad
    this.filterProperties();
  }
}
