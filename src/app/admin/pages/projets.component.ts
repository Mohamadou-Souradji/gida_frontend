import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ETATS_PROJET, PageAdmin, ProjetLigne } from '../../shared/models/admin.model';

/** Tous les projets de la plateforme, avec leur client, prestataire et sequestre. */
@Component({
  selector: 'gj-admin-projets',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Projets' | t }}</h2>
        <p>{{ 'Tous les chantiers de la plateforme, avec leur état et leur séquestre.' | t }}</p>
      </div>
    </div>

    <form class="filtres-bar" (ngSubmit)="rechercher()">
      <div class="champ-groupe champ-grow">
        <label for="q-projets">{{ 'Recherche' | t }}</label>
        <div class="champ-recherche">
          <gj-icone nom="search" [taille]="16"></gj-icone>
          <input id="q-projets" name="q" [(ngModel)]="q" [placeholder]="'Titre, ville ou téléphone du client' | t" />
        </div>
      </div>
      <div class="champ-groupe">
        <label for="etat-projets">{{ 'État' | t }}</label>
        <select id="etat-projets" name="etat" [(ngModel)]="etat" (change)="rechercher()">
          <option value="">{{ 'Tous' | t }}</option>
          <option *ngFor="let e of etats" [value]="e">{{ e | libelle }}</option>
        </select>
      </div>
      <button type="submit"><gj-icone nom="filter" [taille]="16"></gj-icone>{{ 'Rechercher' | t }}</button>
    </form>

    <div class="etat-vide" *ngIf="resultat && !resultat.elements.length">
      <div class="etat-vide__icone"><gj-icone nom="search" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun projet ne correspond.' | t }}</h3>
    </div>

    <div class="tableau-carte" *ngIf="resultat?.elements?.length">
      <table class="tableau-moderne">
        <thead>
          <tr>
            <th>{{ 'Projet' | t }}</th><th>{{ 'Client' | t }}</th><th>{{ 'Prestataire' | t }}</th>
            <th>{{ 'Jalons' | t }}</th><th class="nombre">{{ 'Séquestre' | t }}</th><th>{{ 'État' | t }}</th><th>{{ 'Créé le' | t }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of resultat!.elements">
            <td>
              <a class="lien-titre" [routerLink]="['/admin/projets', p.id]">{{ p.titre }}</a>
              <div class="sous-texte"><gj-icone nom="map-pin" [taille]="12"></gj-icone>{{ p.localisation || '-' }}</div>
            </td>
            <td>{{ p.client.nom }}<div class="sous-texte">{{ p.client.phone }}</div></td>
            <td>
              <ng-container *ngIf="p.prestataire; else aucun">
                {{ p.prestataire.nom }}<div class="sous-texte">{{ p.prestataire.profileType | libelle }}</div>
              </ng-container>
            </td>
            <td>
              <div class="progres progres--fin"><div class="progres__barre" [style.width.%]="p.jalons ? (100 * p.jalonsValides / p.jalons) : 0"></div></div>
              <small>{{ p.jalonsValides }} / {{ p.jalons }}</small>
            </td>
            <td class="nombre">
              <ng-container *ngIf="p.montantSequestreFcfa !== null; else aucun">
                {{ p.montantSequestreFcfa | fcfa }}<div class="sous-texte">{{ 'libéré' | t }} {{ p.montantLibereFcfa | fcfa }}</div>
              </ng-container>
            </td>
            <td><span [class]="p.etat | badge">{{ p.etat | libelle }}</span></td>
            <td class="sous-texte">{{ p.createdAt | date: 'dd/MM/yyyy' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #aucun><span class="aide">-</span></ng-template>
    <gj-pagination *ngIf="resultat" [page]="page" [taille]="taille" [total]="resultat.total" (changer)="aller($event)"></gj-pagination>
  `
})
export class ProjetsAdminComponent implements OnInit {
  etats = ETATS_PROJET;
  q = '';
  etat = '';
  page = 0;
  taille = 20;
  resultat: PageAdmin<ProjetLigne> | null = null;

  constructor(private admin: AdminService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Les filtres vivent dans l'URL : liens depuis le tableau de bord, retour arriere conserve.
    this.route.queryParamMap.subscribe(p => {
      this.q = p.get('q') ?? '';
      this.etat = p.get('etat') ?? '';
      this.page = Number(p.get('page') ?? 0);
      this.admin.projets({ q: this.q, etat: this.etat, page: this.page, taille: this.taille })
        .subscribe(r => (this.resultat = r));
    });
  }

  rechercher(): void {
    this.naviguer(0);
  }

  aller(page: number): void {
    this.naviguer(page);
  }

  private naviguer(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.q || null, etat: this.etat || null, page: page || null }
    });
  }
}
