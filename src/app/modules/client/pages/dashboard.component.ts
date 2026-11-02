import { Component, OnInit } from '@angular/core';
import { ClientService } from '../client.service';
import { ProjetVue } from '../../../shared/models/projet.model';

/** Tableau de bord Client - suivi des projets, de leurs jalons et du sequestre. */
@Component({
  selector: 'gj-client-dashboard',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Mes chantiers' | t }}</h2>
        <p>{{ 'Suivez vos projets, vos jalons et les fonds sécurisés.' | t }}</p>
      </div>
      <div class="page-entete__actions">
        <a class="btn btn-secondaire" routerLink="/client/profil"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon profil' | t }}</a>
        <a class="btn btn-secondaire" routerLink="/client/propositions"><gj-icone nom="file" [taille]="16"></gj-icone>{{ 'Propositions d’études' | t }}</a>
        <a class="btn" routerLink="/client/projets/nouveau"><gj-icone nom="plus" [taille]="16"></gj-icone>{{ 'Nouveau projet' | t }}</a>
      </div>
    </div>

    <ng-container *ngIf="charge; else chargement">
      <ng-container *ngIf="projets.length">
        <div class="kpi-grille">
          <div class="kpi">
            <span class="kpi__icone"><gj-icone nom="briefcase"></gj-icone></span>
            <div><div class="kpi__valeur">{{ projets.length }}</div><div class="kpi__libelle">{{ 'Projets' | t }}</div></div>
          </div>
          <div class="kpi kpi--orange">
            <span class="kpi__icone"><gj-icone nom="alert"></gj-icone></span>
            <div><div class="kpi__valeur">{{ totalAValider() }}</div><div class="kpi__libelle">{{ 'À valider' | t }}</div></div>
          </div>
          <div class="kpi kpi--vert">
            <span class="kpi__icone"><gj-icone nom="check"></gj-icone></span>
            <div><div class="kpi__valeur">{{ totalValides() }} / {{ totalJalons() }}</div><div class="kpi__libelle">{{ 'Jalons validés' | t }}</div></div>
          </div>
          <div class="kpi kpi--or">
            <span class="kpi__icone"><gj-icone nom="lock"></gj-icone></span>
            <div><div class="kpi__valeur">{{ totalSecurise() | fcfa }}</div><div class="kpi__libelle">{{ 'Fonds sécurisés' | t }}</div></div>
          </div>
        </div>

        <div class="projets-grille">
          <a class="projet-carte" *ngFor="let v of projets" [routerLink]="['/client/projets', v.projet.id]">
            <div class="projet-carte__entete">
              <div>
                <h3 class="projet-carte__titre">{{ v.projet.titre }}</h3>
                <div class="projet-carte__meta">
                  <span><gj-icone nom="layers" [taille]="14"></gj-icone>{{ v.projet.typeProjet }}</span>
                  <span><gj-icone nom="map-pin" [taille]="14"></gj-icone>{{ v.projet.localisation }}</span>
                </div>
              </div>
              <span *ngIf="!v.projet.publie" class="badge">{{ 'Brouillon' | t }}</span>
              <span *ngIf="v.projet.publie && !v.escrow" class="badge badge-info">{{ 'Publié' | t }}</span>
              <span *ngIf="v.escrow" [class]="v.escrow.statut | badge">{{ v.escrow.statut | libelle }}</span>
            </div>

            <div class="progres" *ngIf="v.projet.jalons.length">
              <div class="progres__barre" [style.width.%]="avancement(v)"></div>
            </div>

            <div class="projet-carte__pied">
              <span><gj-icone nom="check" [taille]="14"></gj-icone>{{ valides(v) }} / {{ v.projet.jalons.length }} {{ 'Jalons' | t }}</span>
              <span *ngIf="aValider(v)" class="texte-alerte"><gj-icone nom="alert" [taille]="14"></gj-icone>{{ aValider(v) }} {{ 'à valider' | t }}</span>
              <span *ngIf="v.escrow"><gj-icone nom="user-check" [taille]="14"></gj-icone>{{ v.escrow.beneficiaire | nom }}</span>
            </div>
          </a>
        </div>
      </ng-container>

      <div class="etat-vide" *ngIf="!projets.length">
        <div class="etat-vide__icone"><gj-icone nom="briefcase" [taille]="24"></gj-icone></div>
        <h3>{{ 'Aucun projet pour le moment' | t }}</h3>
        <p>{{ 'Complétez votre profil, puis créez votre premier chantier.' | t }}</p>
        <div class="actions">
          <a class="btn btn-secondaire" routerLink="/client/profil"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon profil' | t }}</a>
          <a class="btn" routerLink="/client/projets/nouveau"><gj-icone nom="plus" [taille]="16"></gj-icone>{{ 'Nouveau projet' | t }}</a>
        </div>
      </div>
    </ng-container>

    <ng-template #chargement>
      <div class="squelette"></div>
      <div class="squelette"></div>
    </ng-template>
  `
})
export class DashboardComponent implements OnInit {
  projets: ProjetVue[] = [];
  charge = false;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientService.mesProjets().subscribe(res => {
      this.projets = res;
      this.charge = true;
    });
  }

  valides(v: ProjetVue): number {
    return v.projet.jalons.filter(j => j.statut === 'VALIDE').length;
  }

  aValider(v: ProjetVue): number {
    return v.projet.jalons.filter(j => j.statut === 'SOUMIS').length;
  }

  avancement(v: ProjetVue): number {
    return v.projet.jalons.length ? (100 * this.valides(v)) / v.projet.jalons.length : 0;
  }

  totalJalons(): number {
    return this.projets.reduce((s, v) => s + v.projet.jalons.length, 0);
  }

  totalValides(): number {
    return this.projets.reduce((s, v) => s + this.valides(v), 0);
  }

  totalAValider(): number {
    return this.projets.reduce((s, v) => s + this.aValider(v), 0);
  }

  totalSecurise(): number {
    return this.projets.reduce((s, v) => s + (v.escrow?.montantTotalFcfa ?? 0), 0);
  }
}
