import { Component,OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Property } from '../../models/property';
import { PropertyService } from '../../services/property.service';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  imports:[CommonModule,NgFor],
  selector: 'app-detalle-propiedad',
  templateUrl: './detalle-propiedad.component.html',
  styleUrls: ['./detalle-propiedad.component.css']
})
export class DetallePropiedadComponent implements OnInit{
  property!: Property;
  imagenPrincipal: string = '';

  constructor(private route: ActivatedRoute, private propertyService: PropertyService) {}



ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = (params.get('id') || '').trim().toUpperCase(); // ⚠️ Asegura formato correcto
  
    this.propertyService.getPropiedades().subscribe(data => {
      const prop = data.find(p => (p.IPD || '').trim().toUpperCase() === id);
  
      if (prop) {
        this.property = prop;
        this.imagenPrincipal = prop.imagenes?.[0] || '';
      } else {
        console.warn('❌ No se encontró la propiedad con ID:', id);
      }
    });
  });
  
}

cambiarImagen(img: string) {
  this.imagenPrincipal = img;
}


  createWhatsappLink(property: Property): string {
    const message = `¡Hola! Me interesa la propiedad ${property.TipoPropiedad} en ${property.CIUDAD}, código ${property.IPD}, precio $${property.Precio_Venta}.`;
    return `https://wa.me/${+593998683511}?text=${encodeURIComponent(message)}`;
  }


  compartirPagina() {
    const url = window.location.href;
    const texto = 'Mira esta propiedad que encontré en Inmobiliaria Fénix:';
  
    if (navigator.share) {
      navigator.share({
        title: 'Inmobiliaria Fénix',
        text: texto,
        url: url,
      }).catch((error) => console.error('Error al compartir:', error));
    } else {
      // Fallback para escritorio
       navigator.clipboard.writeText(url).then(() => alert('🔗 Enlace copiado al portapapeles'));
    }
  }
  
}
