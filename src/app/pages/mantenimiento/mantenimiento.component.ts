import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property';
import { PdfService } from '../../pdf.service';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css']
})
export class MantenimientoComponent implements OnInit {
  properties: Property[] = [];
  codigo: string = '';
  filteredProperties: Property[] = [];
  idPropiedadAEliminar: string | null = null;
mostrarConfirmacion: boolean = false;


  constructor(
    private propertyService: PropertyService,
    private pdfService: PdfService,
    private router: Router,
  ) {}


  ngOnInit(): void {
  
    this.propertyService.getPropiedades().subscribe(properties => {
      // Asegurarse de que cada propiedad tenga al menos un array de imágenes
      this.properties = properties.map(p => ({
        ...p,
        imagenes: p.imagenes ?? []  // garantizamos que sea un array, aunque esté vacío
      }));
    });


    this.propertyService.getPropiedades().subscribe((data) => {
      this.properties = data.map(p => ({
        ...p,

        IPD: p.IPD?.toUpperCase().trim() || ''
      }));

      this.filterProperties(); // 
        });
  }
  
  

  modificarPropiedad(id: string) {
    this.router.navigate(['/propiedad', id]);
  }

  getImagenPrincipal(property: Property): string | null {
    return property.imagenes && property.imagenes.length > 0
      ? property.imagenes[0]
      : null;


  }


  exportarListado(tipo: string): void {
    const propiedadesFiltradas = this.properties.filter(p => {
      const estado = p.Estado?.toLowerCase().trim() || '';
  
      if (tipo === 'venta') {
        return estado.includes('venta');
      } else if (tipo === 'arriendo') {
        return estado.includes('renta') || estado.includes('arriendo') || estado.includes('alquiler') || estado.includes('rentado');
      }
  
      return false;
    });
  
    if (propiedadesFiltradas.length === 0) {
      alert(`❗ No hay propiedades en ${tipo}`);
      return;
    }
  
    this.pdfService.generarListadoPropiedades(propiedadesFiltradas, tipo);
  }
  
  
  
  

  prepararEliminacion(id: string) {
    this.idPropiedadAEliminar = id;
    this.mostrarConfirmacion = true;
  }
  
  confirmarEliminacion() {
    if (!this.idPropiedadAEliminar) return;
  
    this.propertyService.eliminarPropiedad(this.idPropiedadAEliminar).then(() => {
      this.properties = this.properties.filter(p => p.id !== this.idPropiedadAEliminar);
      this.mostrarConfirmacion = false;
      this.idPropiedadAEliminar = null;
    });
  }
  
  cancelarEliminacion() {
    this.mostrarConfirmacion = false;
    this.idPropiedadAEliminar = null;
  }

  imprimirPDF(property: Property) {
    this.pdfService.generateProforma(property);
  }

  agregarNuevaPropiedad() {
    this.router.navigate(['/propiedad']); // Sin ID → formulario vacío
  }


  
  filterProperties(): void {

    const filtroCodigo = this.codigo.toLocaleLowerCase().trim();
      
    this.filteredProperties = this.properties.filter(property => {

      const codigo = property.IPD.toLowerCase().trim() || 0;
      const codigoMatch = this.codigo ? codigo == filtroCodigo : true;

  
      return codigoMatch ;
    });
  
    console.log('✅ Propiedades filtradas:', this.filteredProperties.length);
  }
}
