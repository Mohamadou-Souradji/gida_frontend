import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ProfileType } from '../../../shared/models/user.model';

/**
 * Connexion / inscription par code a usage unique, commune aux 6 profils (regle n5).
 * Etape 1 : telephone (+ email a l'inscription) -> le code part par email.
 * Etape 2 : code (+ choix du profil a la premiere connexion).
 */
@Component({
  selector: 'gj-login',
  template: `
    <section class="auth">
      <div class="auth__coque">

        <aside class="auth__panneau">
          <div class="auth__marque">
            <img class="auth__logo-img" src="assets/logo-gida-jari.jpeg" alt="Logo Gida Jari" />
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
                {{ "De l'email vérifié jusqu'à la vérification terrain." | t }}
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

          <!-- Mot de passe oublie : saisie de l'email -->
          <ng-container *ngIf="etape === 'oubli'">
            <h1>{{ 'Mot de passe oublié' | t }}</h1>
            <p class="auth__sous-titre">{{ 'Indiquez l’email de votre compte. Un code de vérification vous y sera envoyé.' | t }}</p>

            <form [formGroup]="oubliForm" (ngSubmit)="envoyerCodeReinitialisation()">
              <label for="email-oubli">{{ 'Adresse email' | t }}</label>
              <input id="email-oubli" class="auth__input auth__input--simple" formControlName="email" type="email" inputmode="email" autocomplete="email" />

              <button type="submit" class="auth__bouton" [disabled]="oubliForm.invalid || envoi">
                <span>{{ 'Recevoir le code' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button type="button" class="auth__bouton auth__bouton--secondaire" (click)="retourConnexion()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                <span>{{ 'Retour à la connexion' | t }}</span>
              </button>
            </form>
          </ng-container>

          <!-- Mot de passe oublie : code et nouveau mot de passe -->
          <ng-container *ngIf="etape === 'reinitialisation'">
            <h1>{{ 'Nouveau mot de passe' | t }}</h1>
            <p class="auth__sous-titre">{{ 'Si un compte existe avec cet email, le code y a été envoyé. Saisissez-le avec votre nouveau mot de passe.' | t }}</p>

            <form [formGroup]="reinitForm" (ngSubmit)="reinitialiserMotDePasse()">
              <label for="code-reinit">{{ 'Code reçu par email' | t }}</label>
              <div class="champ champ--code">
                <input id="code-reinit" class="auth__input auth__input--code" formControlName="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000" />
              </div>

              <label for="nouveau-mdp">{{ 'Nouveau mot de passe (8 caractères minimum)' | t }}</label>
              <input id="nouveau-mdp" class="auth__input auth__input--simple" formControlName="newPassword" type="password" autocomplete="new-password" />

              <label for="confirm-reinit">{{ 'Confirmer le nouveau mot de passe' | t }}</label>
              <input id="confirm-reinit" class="auth__input auth__input--simple" formControlName="confirmPassword" type="password" autocomplete="new-password" />
              <p class="auth__erreur" *ngIf="reinitForm.value.confirmPassword && !motsDePasseReinitIdentiques()">{{ 'Les mots de passe ne correspondent pas.' | t }}</p>

              <button type="submit" class="auth__bouton" [disabled]="reinitForm.invalid || !motsDePasseReinitIdentiques() || envoi">
                <span>{{ 'Enregistrer le mot de passe' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button type="button" class="auth__bouton auth__bouton--secondaire" (click)="retourConnexion()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                <span>{{ 'Retour à la connexion' | t }}</span>
              </button>
            </form>
          </ng-container>

          <!-- Etape 1 : numero (et email a la premiere connexion) -->
          <ng-container *ngIf="etape === 'telephone'">
            <h1>{{ 'Créer mon compte' | t }}</h1>
            <p class="auth__sous-titre" *ngIf="!emailRequis">{{ 'Première connexion : indiquez votre numéro et votre email. Un code vous sera envoyé par email, une seule fois.' | t }}</p>
            <p class="auth__sous-titre" *ngIf="emailRequis">{{ 'Première connexion avec ce numéro : indiquez votre email, le code y sera envoyé.' | t }}</p>

            <form [formGroup]="phoneForm" (ngSubmit)="demanderOtp()">
              <label for="phone">{{ 'Numéro de téléphone' | t }}</label>
              <div class="champ">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <input id="phone" class="auth__input" formControlName="phone" type="tel" inputmode="tel" placeholder="90 00 00 00" autocomplete="tel" />
              </div>

              <ng-container *ngIf="emailRequis">
                <label for="email">{{ 'Adresse email' | t }}</label>
                <div class="champ">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                  <input id="email" class="auth__input" formControlName="email" type="email" inputmode="email" placeholder="nom@exemple.com" autocomplete="email" />
                </div>
              </ng-container>

              <button type="submit" class="auth__bouton" [disabled]="phoneForm.invalid || envoi">
                <span>{{ 'Recevoir le code par email' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </form>
            <p class="auth__lien">
              {{ 'Vous avez déjà un compte ?' | t }}
              <a role="button" tabindex="0" (keydown.enter)="retourConnexion()" (click)="retourConnexion()">{{ 'Se connecter' | t }}</a>
            </p>
          </ng-container>

          <!-- Etape 2 : code recu par email -->
          <ng-container *ngIf="etape === 'code'">
            <h1>{{ 'Code de vérification' | t }}</h1>
            <p class="auth__sous-titre">{{ 'Code envoyé à' | t }} <strong>{{ emailMasque }}</strong></p>

            <form [formGroup]="codeForm" (ngSubmit)="verifierOtp()">
              <label for="code">{{ 'Code reçu par email' | t }}</label>
              <div class="champ champ--code">
                <input id="code" class="auth__input auth__input--code" formControlName="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000" />
              </div>

              <button type="submit" class="auth__bouton" [disabled]="codeForm.invalid || envoi">
                <span>{{ 'Vérifier le code' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button type="button" class="auth__bouton auth__bouton--secondaire" (click)="retourConnexion()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                <span>{{ 'Retour à la connexion' | t }}</span>
              </button>
            </form>
          </ng-container>

          <!-- Connexion : numero + mot de passe (sans code) -->
          <ng-container *ngIf="etape === 'identifiants'">
            <h1>{{ 'Connexion' | t }}</h1>
            <p class="auth__sous-titre">{{ 'Connectez-vous avec votre numéro et votre mot de passe.' | t }}</p>
            <div class="auth__info" *ngIf="messageInfo">{{ messageInfo | t }}</div>

            <form [formGroup]="connexionForm" (ngSubmit)="connecter()">
              <label for="phone-connexion">{{ 'Numéro de téléphone' | t }}</label>
              <div class="champ">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <input id="phone-connexion" class="auth__input" formControlName="phone" type="tel" inputmode="tel" placeholder="90 00 00 00" autocomplete="username" />
              </div>

              <label for="password">{{ 'Mot de passe' | t }}</label>
              <input id="password" class="auth__input auth__input--simple" formControlName="password" type="password" autocomplete="current-password" />

              <p class="auth__lien auth__lien--gauche"><a role="button" tabindex="0" (keydown.enter)="ouvrirMotDePasseOublie()" (click)="ouvrirMotDePasseOublie()">{{ 'Mot de passe oublié ?' | t }}</a></p>

              <button type="submit" class="auth__bouton" [disabled]="connexionForm.invalid || envoi">
                <span>{{ 'Se connecter' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </form>

            <p class="auth__lien">
              {{ 'Première connexion ?' | t }}
              <a role="button" tabindex="0" (keydown.enter)="creerCompte()" (click)="creerCompte()">{{ 'Créer mon compte' | t }}</a>
            </p>
          </ng-container>

          <!-- Etape 4 : nouveau compte -->
          <ng-container *ngIf="etape === 'inscription'">
            <h1>{{ 'Créer mon compte' | t }}</h1>
            <p class="auth__sous-titre">{{ 'Numéro vérifié. Choisissez votre profil et renseignez vos informations.' | t }}</p>

            <form [formGroup]="inscriptionForm" (ngSubmit)="inscrire()">
              <label>{{ 'Profil' | t }}</label>
              <div class="choix-profils" role="radiogroup">
                <label *ngFor="let p of profils" class="choix" [class.choisi]="inscriptionForm.value.profileType === p.code">
                  <input type="radio" formControlName="profileType" [value]="p.code" />
                  <span class="choix__texte">{{ p.code | libelle }}</span>
                  <ng-container *ngIf="inscriptionForm.value.profileType === p.code"><svg class="choix__coche" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></ng-container>
                </label>
              </div>

              <div class="grille-inscription">
                <div>
                  <label for="nom">{{ 'Nom' | t }}</label>
                  <input id="nom" class="auth__input auth__input--simple" formControlName="nom" autocomplete="family-name" />
                </div>
                <div>
                  <label for="prenom">{{ 'Prénom' | t }}</label>
                  <input id="prenom" class="auth__input auth__input--simple" formControlName="prenom" autocomplete="given-name" />
                </div>
              </div>

              <label for="adresse">{{ 'Adresse' | t }}</label>
              <input id="adresse" class="auth__input auth__input--simple" formControlName="adresse" autocomplete="street-address" />

              <label for="password-inscription">{{ 'Mot de passe (8 caractères minimum)' | t }}</label>
              <input id="password-inscription" class="auth__input auth__input--simple" formControlName="password" type="password" autocomplete="new-password" />

              <label for="confirm-password">{{ 'Confirmer le mot de passe' | t }}</label>
              <input id="confirm-password" class="auth__input auth__input--simple" formControlName="confirmPassword" type="password" autocomplete="new-password" />
              <p class="auth__erreur" *ngIf="inscriptionForm.value.confirmPassword && !motsDePasseIdentiques()">{{ 'Les mots de passe ne correspondent pas.' | t }}</p>

              <button type="submit" class="auth__bouton" [disabled]="inscriptionForm.invalid || !motsDePasseIdentiques() || envoi">
                <span>{{ 'Créer mon compte' | t }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button type="button" class="auth__bouton auth__bouton--secondaire" (click)="retourConnexion()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                <span>{{ 'Retour à la connexion' | t }}</span>
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
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
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
      justify-content: center;
      gap: 36px;
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
    .auth__marque { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
    .auth__logo-img {
      width: 128px;
      height: auto;
      border-radius: 20px;
      background: #fff;
      padding: 10px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
      margin-bottom: 14px;
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
    .auth__aide { margin: 12px 0 0; font-size: 13px; color: var(--gj-text-muted); }
    .auth__input--code {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5em;
      height: 60px;
      font-variant-numeric: tabular-nums;
    }

    .auth__input--simple { padding-left: 14px; }
    .auth__info { background: #eef4ff; color: var(--gj-blue); border: 1px solid #cfdcf3; border-radius: 12px; padding: 10px 12px; font-size: 13px; margin: 0 0 16px; }
    .auth__lien { margin: 18px 0 0; font-size: 14px; color: var(--gj-text-muted); text-align: center; }
    .auth__lien a { color: var(--gj-blue); font-weight: 600; cursor: pointer; }
    .auth__lien--gauche { text-align: left; margin-top: 10px; }
    .auth__erreur { color: var(--gj-red); font-size: 13px; margin: 8px 0 0; }
    .grille-inscription { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }
    @media (max-width: 480px) { .grille-inscription { grid-template-columns: 1fr; } }
    .choix-profils { margin-bottom: 18px; }
    .grille-inscription label { margin-top: 0; }
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
      .auth__logo-img { width: 64px; padding: 6px; border-radius: 14px; margin-bottom: 0; }
      .auth__panneau h2 { font-size: 22px; }
      .auth__formulaire { padding: 24px 18px; }
      .auth__formulaire h1 { font-size: 22px; }
      .choix-profils { grid-template-columns: 1fr; }
      .auth__input--code { font-size: 20px; letter-spacing: 0.35em; }
    }
  `]
})
export class LoginComponent implements OnInit {
  etape: 'identifiants' | 'telephone' | 'code' | 'inscription' | 'oubli' | 'reinitialisation' = 'identifiants';
  /** Numero de la reinitialisation (renvoye par le serveur). */
  phoneReinit = '';
  /** Message d'information affiche sur la page de connexion. */
  messageInfo = '';
  phoneNormalise = '';
  /** Le serveur attend l'email du compte (premiere connexion) avant d'envoyer le code. */
  emailRequis = false;
  emailMasque = '';
  envoi = false;

  profils: { code: ProfileType }[] = [
    { code: 'CLIENT_PARTICULIER' }, { code: 'ARTISAN' }, { code: 'ENTREPRISE_BTP' },
    { code: 'INGENIEUR_ARCHITECTE' }, { code: 'FOURNISSEUR_MATERIAUX' }, { code: 'ONG_INSTITUTION' }
  ];

  phoneForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.email, Validators.maxLength(160)]]
  });
  codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]]
  });
  connexionForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.minLength(8)]],
    password: ['', Validators.required]
  });
  inscriptionForm = this.fb.nonNullable.group({
    profileType: ['CLIENT_PARTICULIER' as ProfileType, Validators.required],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    adresse: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  oubliForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]]
  });
  reinitForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private i18n: I18nService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.estConnecte()) {
      this.router.navigate([this.authService.accueil()]);
    }
  }

  /** Ecran « Mot de passe oublie » : saisie de l'email. */
  ouvrirMotDePasseOublie(): void {
    this.messageInfo = '';
    this.oubliForm.reset();
    this.etape = 'oubli';
  }

  /** Envoi du code de reinitialisation (reponse neutre : on passe toujours a l'etape du code). */
  envoyerCodeReinitialisation(): void {
    const { email } = this.oubliForm.getRawValue();
    this.envoi = true;
    this.authService.demanderReinitialisation(email.trim()).subscribe({
      next: res => {
        this.envoi = false;
        this.phoneReinit = res.phone ?? '';
        this.reinitForm.reset();
        this.etape = 'reinitialisation';
      },
      error: () => (this.envoi = false)
    });
  }

  motsDePasseReinitIdentiques(): boolean {
    const { newPassword, confirmPassword } = this.reinitForm.getRawValue();
    return newPassword === confirmPassword;
  }

  /** Definit le nouveau mot de passe, puis retour a la connexion avec le numero prerempli. */
  reinitialiserMotDePasse(): void {
    const { code, newPassword, confirmPassword } = this.reinitForm.getRawValue();
    this.envoi = true;
    this.authService
      .reinitialiserMotDePasse({ phone: this.phoneReinit, code, newPassword, confirmPassword })
      .subscribe({
        next: () => {
          this.envoi = false;
          this.connexionForm.patchValue({ phone: this.phoneReinit, password: '' });
          this.messageInfo = 'Mot de passe réinitialisé. Connectez-vous avec votre nouveau mot de passe.';
          this.etape = 'identifiants';
        },
        error: () => (this.envoi = false)
      });
  }

  motsDePasseIdentiques(): boolean {
    const { password, confirmPassword } = this.inscriptionForm.getRawValue();
    return password === confirmPassword;
  }

  /** Etape 1 : envoi du code. A la premiere connexion, le serveur demande d'abord l'email. */
  demanderOtp(): void {
    const { phone, email } = this.phoneForm.getRawValue();
    this.envoi = true;
    this.authService.demanderOtp(phone, this.emailRequis ? email.trim() : undefined).subscribe({
      next: res => {
        this.envoi = false;
        this.phoneNormalise = res.phone;
        if (res.emailRequis) {
          this.emailRequis = true;
          this.phoneForm.controls.email.addValidators(Validators.required);
          this.phoneForm.controls.email.updateValueAndValidity();
          setTimeout(() => document.getElementById('email')?.focus());
          return;
        }
        this.emailMasque = res.emailMasque ?? '';
        this.etape = 'code';
      },
      error: () => (this.envoi = false)
    });
  }

  /** Etape 2 : verification du code. Compte existant -> mot de passe ; nouveau -> inscription. */
  verifierOtp(): void {
    const { code } = this.codeForm.getRawValue();
    this.envoi = true;
    this.authService.verifierOtp(this.phoneNormalise, code).subscribe({
      next: res => {
        this.envoi = false;
        if (res.compteExistant) {
          this.connexionForm.patchValue({ phone: this.phoneNormalise });
          this.messageInfo = 'Ce numéro a déjà un compte : connectez-vous avec votre mot de passe.';
          this.etape = 'identifiants';
          return;
        }
        this.etape = 'inscription';
      },
      error: () => (this.envoi = false)
    });
  }

  /** Connexion courante : numero + mot de passe, sans code (le code n'est utilise qu'a la creation). */
  connecter(): void {
    const { phone, password } = this.connexionForm.getRawValue();
    this.envoi = true;
    this.messageInfo = '';
    this.authService.connecter(phone, password).subscribe({
      next: () => {
        this.envoi = false;
        this.router.navigate([this.authService.accueil()]);
      },
      error: () => (this.envoi = false)
    });
  }

  /** Etape 4 (nouveau compte) : creation du compte, puis declaration du profil. */
  inscrire(): void {
    this.envoi = true;
    this.authService.inscrire(this.inscriptionForm.getRawValue()).subscribe({
      next: () => {
        this.envoi = false;
        this.router.navigate([this.authService.accueil() + '/profil']);
      },
      error: () => (this.envoi = false)
    });
  }

  /** Premiere connexion : saisie du numero et de l'email pour recevoir le code. */
  creerCompte(): void {
    this.messageInfo = '';
    this.etape = 'telephone';
  }

  /** Retour a la connexion par identifiants. */
  retourConnexion(): void {
    this.messageInfo = '';
    this.emailRequis = false;
    this.emailMasque = '';
    this.phoneForm.controls.email.removeValidators(Validators.required);
    this.phoneForm.controls.email.setValue('');
    this.codeForm.reset();
    this.etape = 'identifiants';
  }

  changerNumero(): void {
    this.creerCompte();
    this.emailRequis = false;
    this.emailMasque = '';
    this.phoneForm.controls.email.removeValidators(Validators.required);
    this.phoneForm.controls.email.setValue('');
    this.codeForm.reset();
  }
}
