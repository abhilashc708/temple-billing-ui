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
 isLoggingIn = false;

  backgroundImages: string[] = [
    'assets/mankurussi-temple-f.JPG',
    'assets/mankurussi-temple-l.JPG',
    'assets/mankurussi-temple-r.JPG'
  ];
currentBgIndex = 0;
  http= inject(HttpClient);
constructor(private authService: AuthService, private router:Router){
  }
ngOnInit() {
  this.startBackgroundSlider();
}
startBackgroundSlider() {
  setInterval(() => {
    this.currentBgIndex =
      (this.currentBgIndex + 1) % this.backgroundImages.length;
  }, 4000); // 🔥 change every 4 sec
}
  onLogin() {
    if (this.isLoggingIn) return; // 🚫 prevent multiple clicks
    this.isLoggingIn = true;
     if (!this.username || !this.password) {
          this.errorMessage = 'Username and password required';
           this.isLoggingIn = false;
             setTimeout(() => {
               this.errorMessage = '';
             }, 3000);
          return;
        }
this.authService.login(this.username, this.password).subscribe({
            next: (response) => {
               this.isLoggingIn = false;
                this.authService.storeToken(response.token, this.username);
                const role = this.authService.getUserRole();
                if (role === 'ADMIN' || role === 'USER') {
                  this.router.navigateByUrl('/dashboard');
                } else {
                  this.router.navigateByUrl('/login');
                }

            },

    error: (err) => {
 this.isLoggingIn = false;
      this.errorMessage = err.error?.message || "Invalid username or password";

      // hide message after 3 seconds
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }
  });

    }
}
