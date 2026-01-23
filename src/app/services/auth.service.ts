import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  user$ = user(this.auth);

  async signUp(email: string, password: string) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/lobby']);
      return credential;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/lobby']);
      return credential;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}