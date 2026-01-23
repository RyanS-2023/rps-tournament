import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createUserProfile(uid: string, email: string, nickname: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await setDoc(userRef, {
      uid,
      email,
      nickname,
      createdAt: new Date()
    });
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  }

  async updateNickname(nickname: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const userRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userRef, { nickname });
  }

  async getCurrentUserNickname(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) return '';

    const profile = await this.getUserProfile(user.uid);
    return profile?.nickname || user.email || 'Player';
  }
}