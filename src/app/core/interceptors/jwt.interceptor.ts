import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Ajoute le token JWT (Bearer) a chaque requete vers l'API Gida Jari et
 * affiche les erreurs renvoyees par le backend ({erreur, message}).
 * Un 401 (session expiree) ramene a l'ecran de connexion.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private toast: ToastService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const requete = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(requete).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !req.url.includes('/auth/')) {
          this.authService.deconnecter();
          this.router.navigate(['/auth/login']);
          this.toast.erreur('Session expirée : reconnectez-vous.');
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
}

export function libelleKyc(niveau: string): string {
  const n = /NIVEAU_(\d)/.exec(niveau ?? '');
  return n ? `niveau ${n[1]}` : niveau;
}
