import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { KycLevel, ORDRE_KYC } from '../../shared/models/user.model';

/**
 * Guard de routage base sur le niveau KYC minimum requis (regle de gestion n4).
 * Usage: data: { kycMinimum: 'NIVEAU_2_IDENTITE_DECLAREE' } sur la route.
 * Si le niveau memorise est insuffisant, il est relu aupres du serveur (il a pu
 * augmenter : profil complete, document valide) avant de rediriger vers /compte/kyc.
 */
@Injectable({ providedIn: 'root' })
export class KycGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {
    const kycMinimum: KycLevel = route.data['kycMinimum'] ?? 'NIVEAU_0_NON_VERIFIE';
    const suffisant = (niveau: KycLevel) => ORDRE_KYC.indexOf(niveau) >= ORDRE_KYC.indexOf(kycMinimum);
    const refus = this.router.createUrlTree(['/compte/kyc'], { queryParams: { requis: kycMinimum } });

    if (suffisant(this.authService.getKycLevel())) {
      return true;
    }
    return this.authService.rafraichirCompte().pipe(
      map(c => (suffisant(c.kycLevel) ? true : refus)),
      catchError(() => of(refus))
    );
  }
}
