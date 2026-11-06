import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { I18nService, Langue } from './core/services/i18n.service';
import { ToastService } from './core/services/toast.service';
import { ApiService } from './core/services/api.service';

/**
 * Coquille applicative : en-tete de marque (charte graphique V3), navigation
 * commune, bascule francais / haoussa, messages flash.
 */
@Component({
  selector: 'gj-root',
  template: `
    <header class="gj-header">
      <a class="gj-header__brand" [routerLink]="authService.estConnecte() ? authService.accueil() : '/auth/login'">
        Gida Jari <span>{{ 'La maison de demain' | t }}</span>
      </a>
      <nav class="gj-header__nav">
        <ng-container *ngIf="authService.estConnecte()">
          <a [routerLink]="authService.accueil()" routerLinkActive="actif"><gj-icone nom="layout" [taille]="16"></gj-icone>{{ 'Tableau de bord' | t }}</a>
          <a routerLink="/compte/messagerie" routerLinkActive="actif"><gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Messagerie' | t }}</a>
          <a routerLink="/compte/notifications" routerLinkActive="actif">
            <gj-icone nom="bell" [taille]="16"></gj-icone>{{ 'Notifications' | t }}
            <span class="pastille" *ngIf="authService.compte?.notificationsNonLues">{{ authService.compte?.notificationsNonLues }}</span>
          </a>
          <a routerLink="/compte" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="actif"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon compte' | t }}</a>
          <a *ngIf="authService.estAdmin()" routerLink="/admin" routerLinkActive="actif"><gj-icone nom="shield" [taille]="16"></gj-icone>{{ 'Administration' | t }}</a>
        </ng-container>
        <span class="langues">
          <button type="button" [class.actif]="i18n.langue === 'fr'" (click)="langue('fr')">FR</button>
          <button type="button" [class.actif]="i18n.langue === 'ha'" (click)="langue('ha')">HA</button>
        </span>
        <button *ngIf="authService.estConnecte()" type="button" class="btn-lien" (click)="deconnecter()"><gj-icone nom="logout" [taille]="16"></gj-icone>{{ 'Déconnexion' | t }}</button>
      </nav>
    </header>

    <main class="gj-container" [class.gj-container--large]="router.url.startsWith('/admin')">
      <router-outlet></router-outlet>
    </main>

    <div class="toasts">
      <div *ngFor="let t of toast.toasts" class="toast toast--{{ t.type }}" (click)="toast.fermer(t.id)">{{ t.texte }}</div>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    public i18n: I18nService,
    public toast: ToastService,
    private api: ApiService,
    public router: Router
  ) {}

  ngOnInit(): void {
    document.documentElement.lang = this.i18n.langue;
    // Rafraichit le compte (niveau KYC, solde, notifications) a chaque navigation.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      if (this.authService.estConnecte()) {
        this.authService.rafraichirCompte().subscribe({ error: () => undefined });
      }
    });
  }

  langue(l: Langue): void {
    this.i18n.changer(l);
    if (this.authService.estConnecte()) {
      this.api.changerLangue(l).subscribe({ error: () => undefined });
    }
  }

  deconnecter(): void {
    this.authService.deconnecter();
    this.router.navigate(['/auth/login']);
  }
}
