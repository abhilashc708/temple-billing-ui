import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem("jwtToken");
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token); // Decode JWT
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

      if (decodedToken.exp && decodedToken.exp > currentTime) {
        return true; // Token is valid
      } else {
        console.log("Token expired. Redirecting to login.");
        localStorage.removeItem("jwtToken"); // Clear expired token
        router.navigateByUrl("login");
        return false;
      }
    } catch (error) {
      console.log("Invalid token. Redirecting to login.");
      localStorage.removeItem("jwtToken"); // Clear invalid token
      router.navigateByUrl("login");
      return false;
    }
  } else {
    console.log("No token found. Redirecting to login.");
    router.navigateByUrl("login");
    return false;
  }
};
