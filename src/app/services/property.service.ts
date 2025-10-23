import { Injectable, inject , NgZone} from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, docData, updateDoc} from '@angular/fire/firestore';
import { Storage, ref, listAll, getDownloadURL } from '@angular/fire/storage';
import { addDoc } from 'firebase/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { query, where, getDocs } from 'firebase/firestore';
import { Property } from '../models/property';


@Injectable({ providedIn: 'root' })
export class PropertyService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private ngZone = inject(NgZone);  // 👈 inyectamos NgZone
  

  getPropiedades(): Observable<Property[]> {
    const propiedadesRef = collection(this.firestore, 'Propiedades');
    return collectionData(propiedadesRef, { idField: 'id' }) as Observable<Property[]>;
  }

  getImagenesPropiedad(folderPath: string): Observable<string[]> {
    if (!folderPath) return from([[]]);
    const folderRef = ref(this.storage, folderPath);

    return from(listAll(folderRef)).pipe(
      switchMap(result => {
        const item = result.items[0];
        return item
          ? from(getDownloadURL(item)).pipe(map(url => [url]))
          : from([[]]);
      })
    );
  }


  getPropiedadPorId(id: string) {
    const docRef = doc(this.firestore, 'Propiedades', id);
    return docData(docRef) as Observable<Property>;
  }
  
  actualizarPropiedad(id: string, data: any) {
    const docRef = doc(this.firestore, 'Propiedades', id);
    return updateDoc(docRef, data);
  }  

  eliminarPropiedad(id: string) {
    // si usas Firestore
    return deleteDoc(doc(this.firestore, 'Propiedades', id));
  }


  actualizarImagenesPropiedad(id: string, nuevasImagenes: string[]) {
    const docRef = doc(this.firestore, 'Propiedades', id);
    return updateDoc(docRef, {
      imagenes: nuevasImagenes
    });
  }

  verificarCodigoExiste(codigo: string): Promise<boolean> {
    const codigoNormalizado = codigo.trim().toLowerCase();
    const propiedadesRef = collection(this.firestore, 'Propiedades');
    const consulta = query(propiedadesRef, where('IPD', '==', codigoNormalizado));
    return getDocs(consulta).then(snapshot => !snapshot.empty);
  }

  
obtenerTodosLosCodigosIPD(): Promise<string[]> {
  const propiedadesRef = collection(this.firestore, 'Propiedades');
  return getDocs(propiedadesRef).then(snapshot =>
    snapshot.docs.map(doc => (doc.data() as Property).IPD?.toLowerCase().trim()).filter(Boolean)
  );}



  crearPropiedad(property: Property): Promise<void> {
    const propiedadesRef = collection(this.firestore, 'Propiedades');
  
    return addDoc(propiedadesRef, {
      ...property,
      ImagenFolder: `imagenes_propiedades/${property.IPD}` // puedes cambiar esto si prefieres usar el ID generado
    }).then(() => {});
  }
  


  
  
}
