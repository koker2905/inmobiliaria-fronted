import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property';
import { CommonModule } from '@angular/common';
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL, listAll } from 'firebase/storage';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-propiedad',
  standalone: true,
  imports:[CommonModule,FormsModule],
  templateUrl: './propiedad.component.html',
  styleUrls: ['./propiedad.component.css']
})
export class PropiedadComponent implements OnInit {
  propertyId: string = '';
  property: Property | null = null;

  nuevasImagenes: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.propertyId) {
      // Modo edición
      this.propertyService.getPropiedadPorId(this.propertyId).subscribe(data => {
        this.property = { id: this.propertyId, ...data };
      });
    } else {
      // Modo creación
      this.generarCodigoIPD().then(codigo => {
      this.property = {
        ASC:'',
        CIUDAD: '',
        TipoPropiedad: '',
        Amoblado: '',
        AreaCons: '',
        AreaTerreno: '',
        BDG: '',
        BNO: '',
        COD: '',
        Direccion_Sector: '',
        Edif_Urb: '',
        Encargado: '',
        Estado: '',
        Extras: '',
        GRJ: '',
        HAB: '',
        IPD: codigo,
        LVD: '',
        Piso: '',
        Precio_Venta: '',
        PROCOD: '',
        ImagenFolder: '',
        imagenes: []
      };
    });
  }
}
  
  

private async generarCodigoIPD(): Promise<string> {
  const codigos = await this.propertyService.obtenerTodosLosCodigosIPD();

  // Filtra los códigos que empiecen con 'av' seguido de dígitos
  const codigosValidos = codigos
    .filter(c => /^av\d+$/i.test(c)) // acepta 'av1', 'AV2', etc.
    .map(c => parseInt(c.slice(2)))  // extrae solo el número después de 'av'
    .filter(n => !isNaN(n));         // elimina resultados inválidos

  const max = codigosValidos.length > 0 ? Math.max(...codigosValidos) : 0;
  const nuevoCodigo = `av${max + 1}`;
  return nuevoCodigo;
}

  

  onImagenesSeleccionadas(event: any) {
    this.nuevasImagenes = Array.from(event.target.files);
  }

  subirNuevasImagenes() {
    if (!this.property?.ImagenFolder || !this.property.id) return;
  
    const storage = getStorage();
    const uploadedUrls: string[] = [];
    let completadas = 0;
  
    this.nuevasImagenes.forEach((file) => {
      const fileRef = ref(storage, `${this.property!.ImagenFolder}/${file.name}`);
      uploadBytes(fileRef, file).then(() => {
        getDownloadURL(fileRef).then(url => {
          uploadedUrls.push(url);
          completadas++;
  
          if (completadas === this.nuevasImagenes.length) {
            // Combinamos imágenes anteriores con nuevas
            const nuevasImagenesTotales = [
              ...(this.property?.imagenes ?? []),
              ...uploadedUrls
            ];
  
            // Guardamos en Firestore usando el nuevo método
            if (!this.property?.id) return;
            this.propertyService.actualizarImagenesPropiedad(this.property.id, nuevasImagenesTotales)

              .then(() => {
            
                this.nuevasImagenes = [];
                this.property!.imagenes = nuevasImagenesTotales;
                console.log('✅ Imágenes actualizadas en Firestore');
              })
              .catch(err => console.error('❌ Error al actualizar imágenes:', err));
          }
        });
      });
    });
  }
  

  guardarCambios() {
    if (!this.property) return;
  
    const esNueva = !this.property.id;
  
    // Limpiar código: sin espacios y en minúsculas
    const ipdLimpio = this.property.IPD?.trim().toLowerCase();
  
    if (!ipdLimpio) {
      alert('❗ El código de la propiedad es obligatorio');
      return;
    }
  
    // Actualizar el IPD limpio en el objeto
    this.property.IPD = ipdLimpio;
  
    if (esNueva) {
      this.propertyService.verificarCodigoExiste(ipdLimpio).then(existe => {
        if (existe) {
          alert('❌ Ya existe una propiedad con este código');
        } else {
          this.propertyService.crearPropiedad(this.property!).then(() => {
            alert('✅ Propiedad creada correctamente');
            this.router.navigate(['/mantenimiento']);
          });
        }
      });
    } else {
      this.propertyService.actualizarPropiedad(this.propertyId, this.property).then(() => {
        alert('✅ Cambios guardados exitosamente');
        this.router.navigate(['/mantenimiento']);
      });
    }
  }
  
  

  cancelar() {
    this.router.navigate(['/mantenimiento']);
  }

  get imagenesPropiedad(): string[] {
    return this.property?.imagenes ?? [];
  }
  

  eliminarImagenYActualizarFirestore(url: string) {
    const storage = getStorage();
    const imageRef = ref(storage, url);
  
    deleteObject(imageRef).then(() => {
      const nuevas = this.property?.imagenes?.filter(img => img !== url) ?? [];
  
      if (this.property?.id) {
        this.propertyService.actualizarImagenesPropiedad(this.property.id, nuevas)
          .then(() => {
            this.property!.imagenes = nuevas;
            console.log('🗑 Imagen eliminada y Firestore actualizado');
          })
          .catch(err => console.error('❌ Error al actualizar Firestore:', err));
      }
    });
  }
  
}
