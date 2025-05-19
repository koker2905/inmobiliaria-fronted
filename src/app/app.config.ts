import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage'; // Importar Firebase Storage

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
      projectId: "inmobiliariafenix-1c6c0",
      appId: "1:242999387978:web:7afc48c715ff7a4a3383b3",
      storageBucket: "inmobiliariafenix-1c6c0.firebasestorage.app", // Tu storageBucket
      apiKey: "AIzaSyAOG6K9wERYQaB8LMVSbmvzD0UPr9Y20_k",
      authDomain: "inmobiliariafenix-1c6c0.firebaseapp.com",
      messagingSenderId: "242999387978",
      measurementId: "G-W0PRPQMD31"
    })),
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()) // Agregar Firebase Storage
  ]
};
