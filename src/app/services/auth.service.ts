import { Injectable, inject } from '@angular/core';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAuth, updateEmail, signOut,deleteUser } from 'firebase/auth';
import {Auth}from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  constructor() {}

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }
}
