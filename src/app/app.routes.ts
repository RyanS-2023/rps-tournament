import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameComponent } from './components/game/game.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'signup', 
    component: SignupComponent
  },
  { 
    path: 'lobby', 
    component: LobbyComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stats',
    loadComponent: () => import('./components/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [AuthGuard]
  },
  { 
  path: 'leaderboard', 
  component: LeaderboardComponent,
  canActivate: [AuthGuard]
  },
  {
  path: 'friends',
  loadComponent: () => import('./components/friends/friends.component').then(m => m.FriendsComponent),
  canActivate: [AuthGuard]
  },
  {
  path: 'slots',
  loadComponent: () => import('./components/slots/slots.component').then(m => m.SlotsComponent),
  canActivate: [AuthGuard]
  },
  {
  path: 'video-poker',
  loadComponent: () => import('./components/video-poker/video-poker.component').then(m => m.VideoPokerComponent),
  canActivate: [AuthGuard]
  },
  { 
    path: 'game/:tournamentId', 
    component: GameComponent,
    canActivate: [AuthGuard]
  }
];

//===============================
/*
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent) 
  },
  { 
    path: 'lobby', 
    loadComponent: () => import('./components/lobby/lobby.component').then(m => m.LobbyComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'game/:tournamentId', 
    loadComponent: () => import('./components/game/game.component').then(m => m.GameComponent),
    canActivate: [AuthGuard]
  }
];
*/