import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Property } from '../models/property';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(private firestore: Firestore) {}

  getPropiedades(): Observable<Property[]> {
    const propiedadesRef = collection(this.firestore, 'Propiedades');
    return collectionData(propiedadesRef, { idField: 'id' }) as Observable<Property[]>;
  }
}
