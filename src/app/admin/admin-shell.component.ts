import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../core/services/admin.service';
import { AuthService } from '../core/services/auth.service';

/** Mise en page du back-office : menu lateral (horizontal sur mobile) + contenu. */
@Component({
  selector: 'gj-admin-shell',
  template: `
    <div class="bo">
      <aside class="bo__menu">
        <div class="bo__profil">
          <span class="bo__logo"><gj-icone nom="shield" [taille]="18"></gj-icone></span>
          <div>
            <p class="bo__titre">{{ 'Administration' | t }}</p>
            <p class="bo__role" *ngIf="admin.moi"><span [class]="admin.moi.role | badge">{{ admin.moi.role | libelle }}</span></p>
          </div>
        </div>
        <nav>
          <a routerLink="/admin" routerLinkActive="actif" [routerLinkActiveOptions]="{ exact: true }"><gj-icone nom="layout"></gj-icone>{{ 'Tableau de bord' | t }}</a>
          <a routerLink="/admin/projets" routerLinkActive="actif"><gj-icone nom="briefcase"></gj-icone>{{ 'Projets' | t }}</a>
          <a routerLink="/admin/transactions" routerLinkActive="actif"><gj-icone nom="wallet"></gj-icone>{{ 'Transactions' | t }}</a>
          <a routerLink="/admin/kyc" routerLinkActive="actif"><gj-icone nom="user-check"></gj-icone>KYC</a>
          <a routerLink="/admin/litiges" routerLinkActive="actif"><gj-icone nom="scale"></gj-icone>{{ 'Litiges' | t }}</a>
          <a routerLink="/admin/equipe" routerLinkActive="actif"><gj-icone nom="users"></gj-icone>{{ 'Équipe' | t }}</a>
          <a routerLink="/admin/journal" routerLinkActive="actif"><gj-icone nom="list"></gj-icone>{{ 'Journal' | t }}</a>
        </nav>
      </aside>
      <section class="bo__contenu">
        <router-outlet *ngIf="admin.moi"></router-outlet>
        <div class="squelette" *ngIf="!admin.moi"></div>
      </section>
    </div>
  `
})
export class AdminShellComponent implements OnInit {
  constructor(public admin: AdminService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.admin.chargerMoi().subscribe({
      // Role retire entre-temps : retour a l'espace habituel
      error: () => this.router.navigateByUrl(this.auth.accueil())
    });
  }
}
