import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Reserve le back-office aux administrateurs (role ADMIN porte par le JWT). */
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.authService.estAdmin() ? true : this.router.parseUrl(this.authService.accueil());
  }
}
