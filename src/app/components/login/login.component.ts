import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>🎮 RPS Tournament</h1>
        <h2>Login</h2>
        
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required>
          </div>
          
          <button type="submit" class="btn-primary">Login</button>
          
          @if (errorMessage) {
            <div class="error">{{ errorMessage }}</div>
          }
        </form>
        
        <p class="auth-link">
          Don't have an account? <a routerLink="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .auth-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    
    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 10px;
      font-size: 2em;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 5px;
      font-size: 16px;
      box-sizing: border-box;
    }
    
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .btn-primary {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .btn-primary:hover {
      background: #5568d3;
    }
    
    .error {
      margin-top: 15px;
      padding: 10px;
      background: #fee;
      color: #c33;
      border-radius: 5px;
      text-align: center;
    }
    
    .auth-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }
    
    .auth-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  
  email = '';
  password = '';
  errorMessage = '';

  async onLogin() {
    try {
      this.errorMessage = '';
      await this.authService.login(this.email, this.password);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
