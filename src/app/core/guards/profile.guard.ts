import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileType } from '../../shared/models/user.model';

/**
 * Guard de routage base sur le type de profil (Cahier des Charges, section 3.2).
 * Usage: data: { profilsAutorises: ['ARTISAN'] } sur la route.
 */
@Injectable({ providedIn: 'root' })
export class ProfileGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const profilsAutorises: ProfileType[] = route.data['profilsAutorises'] ?? [];
    const profil = this.authService.getProfileType();
    if (profil && profilsAutorises.includes(profil)) {
      return true;
    }
    return this.router.parseUrl(this.authService.accueil());
  }
}
