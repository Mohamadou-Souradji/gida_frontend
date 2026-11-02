import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Compte, KycLevel, ProfileType } from '../../shared/models/user.model';

const TOKEN_KEY = 'gj_token';
const USER_ID_KEY = 'gj_user_id';
const PROFILE_KEY = 'gj_profile_type';
const KYC_KEY = 'gj_kyc_level';
const ADMIN_KEY = 'gj_admin';

/** Route d'accueil de chaque profil. */
export const ACCUEIL_PAR_PROFIL: Record<ProfileType, string> = {
  CLIENT_PARTICULIER: '/client',
  ARTISAN: '/artisan',
  ENTREPRISE_BTP: '/entreprise-btp',
  INGENIEUR_ARCHITECTE: '/expert',
  FOURNISSEUR_MATERIAUX: '/fournisseur',
  ONG_INSTITUTION: '/ong'
};

/**
 * Authentification par OTP SMS - consomme /api/auth (voir AuthController backend).
 * La session (token + profil + niveau KYC) est conservee dans le localStorage ;
 * le niveau KYC et le solde sont rafraichis via /api/compte/moi.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Derniere version connue du compte (rafraichie par rafraichirCompte()). */
  compte: Compte | null = null;

  constructor(private http: HttpClient) {}

  demanderOtp(phone: string): Observable<{ phone: string; nouvelUtilisateur: boolean }> {
    return this.http.post<{ phone: string; nouvelUtilisateur: boolean }>(
      `${environment.apiBaseUrl}/auth/otp/demander`, { phone });
  }

  verifierOtp(phone: string, code: string, profileType?: ProfileType): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/otp/verifier`, { phone, code, profileType })
      .pipe(tap(res => this.sauvegarderSession(res)));
  }

  rafraichirCompte(): Observable<Compte> {
    return this.http.get<Compte>(`${environment.apiBaseUrl}/compte/moi`).pipe(
      tap(c => {
        this.compte = c;
        localStorage.setItem(KYC_KEY, c.kycLevel);
        localStorage.setItem(ADMIN_KEY, String(c.admin));
      })
    );
  }

  sauvegarderSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_ID_KEY, res.userId);
    localStorage.setItem(PROFILE_KEY, res.profileType);
    localStorage.setItem(KYC_KEY, res.kycLevel);
    localStorage.setItem(ADMIN_KEY, String(res.admin));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserId(): string {
    return localStorage.getItem(USER_ID_KEY) ?? '';
  }

  getProfileType(): ProfileType | null {
    return localStorage.getItem(PROFILE_KEY) as ProfileType | null;
  }

  getKycLevel(): KycLevel {
    return (localStorage.getItem(KYC_KEY) as KycLevel) ?? 'NIVEAU_0_NON_VERIFIE';
  }

  estAdmin(): boolean {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  }

  estConnecte(): boolean {
    return !!this.getToken();
  }

  accueil(): string {
    const profil = this.getProfileType();
    return profil ? ACCUEIL_PAR_PROFIL[profil] : '/auth/login';
  }

  deconnecter(): void {
    [TOKEN_KEY, USER_ID_KEY, PROFILE_KEY, KYC_KEY, ADMIN_KEY].forEach(k => localStorage.removeItem(k));
    this.compte = null;
  }
}
