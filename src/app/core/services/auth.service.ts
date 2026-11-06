import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Compte, KycLevel, ProfileType } from '../../shared/models/user.model';

const TOKEN_KEY = 'gj_token';
const REFRESH_KEY = 'gj_refresh_token';
const USER_ID_KEY = 'gj_user_id';
const PROFILE_KEY = 'gj_profile_type';
const KYC_KEY = 'gj_kyc_level';
const ADMIN_KEY = 'gj_admin';

/** Reponse de /auth/send-otp. */
export interface ReponseDemandeOtp {
  phone: string;
  nouvelUtilisateur: boolean;
  canal: 'EMAIL' | 'SMS';
  /** true : aucun code envoye, il faut fournir l'email (premiere connexion). */
  emailRequis: boolean;
  /** Ex. a***e@gmail.com : ou le code a ete envoye. */
  emailMasque?: string;
}

/** Reponse de /auth/verify-otp : jeton temporaire (10 min). compteExistant = true si le compte existe deja. */
export interface ReponseVerifierOtp {
  temporaryToken: string;
  phone: string;
  emailMasque?: string;
  compteExistant?: boolean;
  userId?: string;
  profileType?: ProfileType;
}

/** Reponse de /auth/forgot-password : reponse neutre (le compte peut ne pas exister). */
export interface ReponseMotDePasseOublie {
  message: string;
  phone?: string;
  emailMasque?: string;
}

/** Donnees de reinitialisation (/auth/reset-password). */
export interface DonneesReinitialisation {
  phone: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

/** Donnees de creation de compte (/auth/register). */
export interface DonneesInscription {
  profileType: ProfileType;
  nom: string;
  prenom: string;
  adresse: string;
  password: string;
  confirmPassword: string;
}

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
 * Authentification - consomme /api/auth du backend Gida Jari.
 *  - Nouveau compte : send-otp -> verify-otp (jeton temporaire) -> register (session).
 *  - Compte existant : send-otp -> verify-otp -> login (mot de passe, session).
 *  - Session : accessToken (1 h) + refreshToken (7 j), renouvele par /auth/refresh.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Derniere version connue du compte (rafraichie par rafraichirCompte()). */
  compte: Compte | null = null;

  /** Jeton temporaire de l'etape code (memoire seulement, 10 min). */
  private jetonTemporaire: string | null = null;

  constructor(private http: HttpClient) {}

  /** Demande du code par email. A la premiere connexion, le serveur repond emailRequis=true. */
  demanderOtp(phone: string, email?: string): Observable<ReponseDemandeOtp> {
    return this.http.post<ReponseDemandeOtp>(`${environment.apiBaseUrl}/auth/send-otp`, email ? { phone, email } : { phone });
  }

  /** Verifie le code. Garde le jeton temporaire pour l'inscription. */
  verifierOtp(phone: string, code: string): Observable<ReponseVerifierOtp> {
    return this.http
      .post<ReponseVerifierOtp>(`${environment.apiBaseUrl}/auth/verify-otp`, { phone, code })
      .pipe(tap(res => (this.jetonTemporaire = res.temporaryToken)));
  }

  /** Compte existant : connexion par mot de passe. */
  connecter(phone: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { phone, password })
      .pipe(tap(res => this.sauvegarderSession(res)));
  }

  /** Nouveau compte : creation avec le jeton temporaire, puis ouverture de session. */
  inscrire(donnees: DonneesInscription): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, { temporaryToken: this.jetonTemporaire ?? '', ...donnees })
      .pipe(
        tap(res => {
          this.jetonTemporaire = null;
          this.sauvegarderSession(res);
        })
      );
  }

  /** Mot de passe oublie : un code est envoye par email si le compte existe. */
  demanderReinitialisation(email: string): Observable<ReponseMotDePasseOublie> {
    return this.http.post<ReponseMotDePasseOublie>(`${environment.apiBaseUrl}/auth/forgot-password`, { email });
  }

  /** Definit le nouveau mot de passe avec le code recu. */
  reinitialiserMotDePasse(donnees: DonneesReinitialisation): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${environment.apiBaseUrl}/auth/reset-password`, donnees);
  }

  /** Renouvelle l'accessToken avec le refreshToken. */
  rafraichirJeton(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken: this.getRefreshToken() })
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
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_ID_KEY, res.userId);
    localStorage.setItem(PROFILE_KEY, res.profileType);
    localStorage.setItem(KYC_KEY, res.kycLevel);
    localStorage.setItem(ADMIN_KEY, String(res.admin));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
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
    [TOKEN_KEY, REFRESH_KEY, USER_ID_KEY, PROFILE_KEY, KYC_KEY, ADMIN_KEY].forEach(k => localStorage.removeItem(k));
    this.compte = null;
    this.jetonTemporaire = null;
  }
}
