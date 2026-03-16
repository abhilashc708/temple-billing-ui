import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
      CommonModule,   // ✅ REQUIRED for *ngIf
      FormsModule     // ✅ REQUIRED for ngModel
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username = '';
  password = '';
 errorMessage: string = '';   // ✅ ADD THIS LINE
  http= inject(HttpClient);

constructor(private authService: AuthService, private router:Router){
  }

  onLogin() {
     if (!this.username || !this.password) {
          this.errorMessage = 'Username and password required';
          return;
        }
this.authService.login(this.username, this.password).subscribe({
            next: (response) => {
                this.authService.storeToken(response.token, this.username);
                const role = this.authService.getUserRole();
                if (role === 'ADMIN' || role === 'USER') {
                  this.router.navigateByUrl('/dashboard');
                } else {
                  this.router.navigateByUrl('/login');
                }

            },

    error: (err) => {

      this.errorMessage = err.error?.message || "Invalid username or password";

      // hide message after 3 seconds
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }
  });

    }
}
