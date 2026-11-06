import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Ajoute le token JWT (Bearer) a chaque requete vers l'API et affiche les erreurs
 * renvoyees par le backend ({erreur, message}).
 * Sur un 401 (access token expire), tente un renouvellement avec le refresh token,
 * puis rejoue la requete. Si le renouvellement echoue, retour a la connexion.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private toast: ToastService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(this.avecToken(req)).pipe(
      catchError((err: HttpErrorResponse) => {
        const estAuth = req.url.includes('/auth/');

        if (err.status === 401 && !estAuth && this.authService.getRefreshToken()) {
          return this.authService.rafraichirJeton().pipe(
            switchMap(() => next.handle(this.avecToken(req))),
            catchError(() => {
              this.deconnexion();
              return throwError(() => err);
            })
          );
        }

        if (err.status === 401 && !estAuth) {
          this.deconnexion();
        } else if (err.status === 0) {
          this.toast.erreur('Serveur injoignable. Vérifiez votre connexion.');
        } else if (err.error?.erreur === 'KYC_INSUFFISANT') {
          this.toast.erreur(`Niveau de vérification insuffisant (requis : ${libelleKyc(err.error.niveauRequis)}). Complétez votre profil ou votre KYC.`);
        } else {
          this.toast.erreur(err.error?.message ?? `Erreur ${err.status}`);
        }
        return throwError(() => err);
      })
    );
  }

  private avecToken(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = this.authService.getToken();
    return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  }

  private deconnexion(): void {
    this.authService.deconnecter();
    this.router.navigate(['/auth/login']);
    this.toast.erreur('Session expirée : reconnectez-vous.');
  }
}

export function libelleKyc(niveau: string): string {
  const n = /NIVEAU_(\d)/.exec(niveau ?? '');
  return n ? `niveau ${n[1]}` : niveau;
}
