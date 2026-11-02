import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Projet } from '../models/projet.model';

/** Vitrine des projets publies sans prestataire (artisans, entreprises, experts). */
@Component({
  selector: 'gj-projets-ouverts',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Projets ouverts' | t }}</h2>
        <p>{{ 'Chantiers publiés sans prestataire engagé.' | t }}</p>
      </div>
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !projets.length">
      <div class="etat-vide__icone"><gj-icone nom="layers" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun élément' | t }}</h3>
      <p>{{ 'Les nouveaux projets publiés apparaîtront ici.' | t }}</p>
    </div>

    <div class="projets-grille" *ngIf="projets.length">
      <article class="projet-carte" *ngFor="let p of projets">
        <div class="projet-carte__entete">
          <div>
            <h3 class="projet-carte__titre">{{ p.titre }}</h3>
            <div class="projet-carte__meta">
              <span><gj-icone nom="layers" [taille]="14"></gj-icone>{{ p.typeProjet }}</span>
              <span><gj-icone nom="map-pin" [taille]="14"></gj-icone>{{ p.localisation }}</span>
            </div>
          </div>
        </div>
        <p class="projet-carte__texte">{{ p.description }}</p>
        <div class="projet-carte__pied">
          <span><gj-icone nom="wallet" [taille]="14"></gj-icone><strong class="montant">{{ p.budgetEstimeFcfa | fcfa }}</strong></span>
          <span><gj-icone nom="check" [taille]="14"></gj-icone>{{ p.jalons.length }} {{ 'Jalons' | t }}</span>
        </div>
        <a class="btn btn-secondaire btn-pleine" [routerLink]="['/compte/messagerie']" [queryParams]="{ a: p.client?.id, projet: p.id }">
          <gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Contacter le client' | t }}
        </a>
      </article>
    </div>
  `
})
export class ProjetsOuvertsComponent implements OnInit {
  projets: Projet[] = [];
  charge = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.projetsOuverts().subscribe(res => {
      this.projets = res;
      this.charge = true;
    });
  }
}
