import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ProfileType } from '../../../shared/models/user.model';

/**
 * Connexion / inscription par OTP SMS, commune aux 6 profils (regle n5).
 * Etape 1 : telephone -> envoi du code. Etape 2 : code (+ choix du profil a la premiere connexion).
 */
@Component({
  selector: 'gj-login',
  template: `
    <section class="auth">
      <div class="auth__coque">

        <aside class="auth__panneau" aria-hidden="false">
          <div class="auth__logo">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>

          <div>
            <h2>Gida Jari</h2>
            <p>{{ 'La maison de demain' | t }}</p>
          </div>

          <ul class="auth__atouts">
            <li>
              <span class="auth__atout-icone">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </span>
              <span>
                <strong>{{ 'Fonds sécurisés' | t }}</strong><br />
                {{ "Le paiement reste bloqué jusqu'à la validation du travail." | t }}
              </span>
            </li>
            <li>
              <span class="auth__atout-icone">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m16 11 2 2 4-4"/>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </span>
              <span>
                <strong>{{ 'Identité vérifiée par niveaux' | t }}</strong><br />
                {{ "Du téléphone vérifié jusqu'à la vérification terrain." | t }}
              </span>
            </li>
            <li>
              <span class="auth__atout-icone">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
                </svg>
              </span>
              <span>
                <strong>{{ 'Mobile Money' | t }}</strong><br />
                {{ 'Payez et soyez payé avec les opérateurs locaux.' | t }}
              </span>
            </li>
          </ul>
        </aside>

        <div class="auth__formulaire">

          <ng-container *ngIf="!otpEnvoye">
            <h1>{{ 'Connexion' | t }}</h1>
            <p class="auth__sous-titre">{{ 'Entrez votre numéro pour recevoir un code par SMS.' | t }}</p>

            <form [formGroup]="phoneForm" (ngSubmit)="demanderOtp()">
              <label for="phone">{{ 'Numéro de téléphone' | t }}</label>
              <div class="champ">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input id="phone" class="auth__input" formControlName="phone" type="tel" inputmode="tel" placeholder="90 00 00 00" autocomplete="tel" />
              </div>

              <button type="submit" class="auth__bouton" [disabled]="phoneForm.invalid || envoi">
                <span>{{ 'Recevoir le code' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
            </form>
          </ng-container>

          <ng-container *ngIf="otpEnvoye">
            <h1>{{ 'Code de vérification' | t }}</h1>
            <p class="auth__sous-titre">
              {{ 'Code envoyé au' | t }} <strong>{{ phoneNormalise }}</strong>
            </p>

            <form [formGroup]="otpForm" (ngSubmit)="verifierOtp()">
              <label for="code">{{ 'Code reçu par SMS' | t }}</label>
              <div class="champ champ--code">
                <input id="code" class="auth__input auth__input--code" formControlName="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000" />
              </div>

              <ng-container *ngIf="nouvelUtilisateur">
                <label>{{ 'Première connexion : choisissez votre profil' | t }}</label>
                <div class="choix-profils" role="radiogroup">
                  <label *ngFor="let p of profils" class="choix" [class.choisi]="otpForm.value.profileType === p.code">
                    <input type="radio" formControlName="profileType" [value]="p.code" />
                    <span class="choix__texte">{{ p.code | libelle }}</span>
                    <svg *ngIf="otpForm.value.profileType === p.code" class="choix__coche" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </label>
                </div>
              </ng-container>

              <button type="submit" class="auth__bouton" [disabled]="otpForm.invalid || envoi">
                <span>{{ 'Se connecter' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </button>

              <button type="button" class="auth__bouton auth__bouton--secondaire" (click)="otpEnvoye = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
                </svg>
                <span>{{ 'Changer de numéro' | t }}</span>
              </button>
            </form>
          </ng-container>

        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .auth {
      min-height: calc(100vh - 150px);
      display: grid;
      place-items: center;
    }

    .auth__coque {
      width: 100%;
      max-width: 960px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #fff;
      border: 1px solid var(--gj-border);
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(18, 41, 77, 0.12);
      overflow: hidden;
    }

    /* Panneau de marque (gauche) */
    .auth__panneau {
      background: linear-gradient(150deg, var(--gj-blue) 0%, var(--gj-blue-dark) 100%);
      color: #fff;
      padding: 44px 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 32px;
    }
    .auth__logo {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.12);
      display: grid;
      place-items: center;
      color: var(--gj-gold);
    }
    .auth__panneau h2 {
      color: #fff;
      font-size: 28px;
      margin: 0 0 4px;
    }
    .auth__panneau p {
      color: rgba(255, 255, 255, 0.78);
      margin: 0;
      font-size: 15px;
    }
    .auth__atouts {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .auth__atouts li {
      display: flex;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 14px;
      margin: 0;
      padding: 0;
      background: none;
      border: 0;
      box-shadow: none;
      color: rgba(255, 255, 255, 0.92);
      font-size: 14px;
      line-height: 1.45;
    }
    .auth__atouts strong { color: #fff; font-weight: 700; }
    .auth__atouts li > span:last-child { flex: 1; min-width: 0; }
    .auth__atout-icone {
      flex: none;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.14);
      color: var(--gj-gold);
      display: grid;
      place-items: center;
    }

    /* Zone de formulaire (droite) */
    .auth__formulaire {
      padding: 44px 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .auth__formulaire h1 {
      font-size: 26px;
      margin: 0 0 6px;
    }
    .auth__sous-titre {
      color: var(--gj-text-muted);
      font-size: 14px;
      margin: 0 0 24px;
    }
    .auth__sous-titre strong { color: var(--gj-text); }

    /* Le formulaire perd le style "carte" global : la carte est deja le conteneur */
    .auth form {
      background: none;
      border: 0;
      box-shadow: none;
      padding: 0;
      margin: 0;
      max-width: none;
    }

    .auth label {
      display: block;
      margin: 16px 0 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--gj-text);
      text-transform: none;
      letter-spacing: 0;
    }
    .auth label:first-of-type { margin-top: 0; }

    .champ {
      position: relative;
    }
    .champ > svg {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gj-text-muted);
      pointer-events: none;
    }
    .auth__input {
      height: 52px;
      padding: 0 14px 0 44px;
      font-size: 16px;
      border-radius: 12px;
      border: 1px solid var(--gj-border);
    }
    .auth__input:focus {
      border-color: var(--gj-blue);
      box-shadow: 0 0 0 4px rgba(26, 60, 110, 0.12);
    }
    .champ--code > .auth__input { padding-left: 14px; }
    .auth__input--code {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5em;
      height: 60px;
      font-variant-numeric: tabular-nums;
    }

    /* Boutons */
    .auth .auth__bouton {
      width: 100%;
      height: 52px;
      margin: 14px 0 0;
      font-size: 15px;
      border-radius: 12px;
      gap: 8px;
    }
    .auth .auth__bouton + .auth__bouton { margin-top: 10px; margin-left: 0; }
    .auth__bouton--secondaire {
      background: #fff;
      color: var(--gj-blue);
      border: 1px solid var(--gj-border);
    }
    .auth__bouton--secondaire:hover {
      background: #f3f6fb;
    }

    /* Choix du profil (premiere connexion) */
    .choix-profils {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .choix-profils .choix {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 11px 12px;
      border: 1px solid var(--gj-border);
      border-radius: 12px;
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      color: var(--gj-text);
      cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .choix-profils .choix:hover { border-color: #c5d0e0; }
    .choix-profils .choix.choisi {
      border-color: var(--gj-blue);
      background: #eef2f8;
      font-weight: 600;
    }
    .choix-profils input[type="radio"] {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
      margin: 0;
    }
    .choix__texte { flex: 1; min-width: 0; }
    .choix__coche { flex: none; color: var(--gj-blue); }

    /* Tablette et mobile */
    @media (max-width: 820px) {
      .auth { min-height: auto; place-items: start center; }
      .auth__coque { grid-template-columns: 1fr; border-radius: 16px; }
      .auth__panneau { padding: 24px; gap: 18px; }
      .auth__atouts { display: none; }
      .auth__formulaire { padding: 28px 24px; }
    }

    @media (max-width: 480px) {
      .auth__panneau { padding: 20px; flex-direction: row; align-items: center; }
      .auth__logo { width: 44px; height: 44px; border-radius: 12px; }
      .auth__panneau h2 { font-size: 22px; }
      .auth__formulaire { padding: 24px 18px; }
      .auth__formulaire h1 { font-size: 22px; }
      .choix-profils { grid-template-columns: 1fr; }
      .auth__input--code { font-size: 20px; letter-spacing: 0.35em; }
    }
  `]
})
export class LoginComponent implements OnInit {
  otpEnvoye = false;
  nouvelUtilisateur = false;
  phoneNormalise = '';
  envoi = false;

  profils: { code: ProfileType }[] = [
    { code: 'CLIENT_PARTICULIER' }, { code: 'ARTISAN' }, { code: 'ENTREPRISE_BTP' },
    { code: 'INGENIEUR_ARCHITECTE' }, { code: 'FOURNISSEUR_MATERIAUX' }, { code: 'ONG_INSTITUTION' }
  ];

  phoneForm = this.fb.nonNullable.group({ phone: ['', [Validators.required, Validators.minLength(8)]] });
  otpForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
    profileType: ['CLIENT_PARTICULIER' as ProfileType]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private i18n: I18nService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.estConnecte()) {
      this.router.navigate([this.authService.accueil()]);
    }
  }

  demanderOtp(): void {
    this.envoi = true;
    this.authService.demanderOtp(this.phoneForm.getRawValue().phone).subscribe({
      next: res => {
        this.phoneNormalise = res.phone;
        this.nouvelUtilisateur = res.nouvelUtilisateur;
        this.otpEnvoye = true;
        this.envoi = false;
      },
      error: () => (this.envoi = false)
    });
  }

  verifierOtp(): void {
    const { code, profileType } = this.otpForm.getRawValue();
    this.envoi = true;
    this.authService.verifierOtp(this.phoneNormalise, code, this.nouvelUtilisateur ? profileType : undefined).subscribe({
      next: () => {
        this.envoi = false;
        // Nouveau compte : direction le profil pour declarer son identite (KYC niveau 2).
        const accueil = this.authService.accueil();
        this.router.navigate([this.nouvelUtilisateur ? accueil + '/profil' : accueil]);
      },
      error: () => (this.envoi = false)
    });
  }
}
