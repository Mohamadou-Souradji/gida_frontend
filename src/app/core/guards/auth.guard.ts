import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Bloque l'acces aux routes protegees si l'utilisateur n'est pas authentifie. */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.authService.estConnecte() ? true : this.router.parseUrl('/auth/login');
  }
}
