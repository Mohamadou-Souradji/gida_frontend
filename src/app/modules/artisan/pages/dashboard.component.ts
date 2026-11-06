import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Tableau de bord Artisan (roadmap 50%) : bascule de disponibilite
 * AVAILABLE_NOW / UNAVAILABLE + missions avec envoi de preuve photo GPS.
 */
@Component({
  selector: 'gj-artisan-dashboard',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Tableau de bord' | t }}</h2>
        <p>{{ 'Gérez votre disponibilité et vos missions.' | t }}</p>
      </div>
      <div class="page-entete__actions">
        <a class="btn btn-secondaire" routerLink="/artisan/projets"><gj-icone nom="layers" [taille]="16"></gj-icone>{{ 'Projets ouverts' | t }}</a>
        <a class="btn btn-secondaire" routerLink="/artisan/profil"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon profil' | t }}</a>
      </div>
    </div>

    <section class="carte-section dispo">
      <div class="dispo__statut">
        <span class="dispo__pastille" [class.dispo__pastille--on]="disponibilite === 'AVAILABLE_NOW'"></span>
        <div>
          <div class="kpi__libelle">{{ 'Statut' | t }}</div>
          <div class="dispo__texte">
            {{ disponibilite === 'AVAILABLE_NOW' ? ('Disponible pour de nouvelles missions' | t) : ('Indisponible' | t) }}
          </div>
        </div>
        <span [class]="disponibilite | badge">{{ disponibilite | libelle }}</span>
      </div>
      <div class="dispo__actions">
        <button type="button" class="btn-success" [disabled]="disponibilite === 'AVAILABLE_NOW'" (click)="basculer('AVAILABLE_NOW')">
          <gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Je suis disponible' | t }}
        </button>
        <button type="button" class="btn-warning" [disabled]="disponibilite === 'UNAVAILABLE'" (click)="basculer('UNAVAILABLE')">
          <gj-icone nom="clock" [taille]="16"></gj-icone>{{ 'Je ne suis pas disponible' | t }}
        </button>
      </div>
    </section>

    <gj-missions></gj-missions>
  `
})
export class ArtisanDashboardComponent implements OnInit {
  disponibilite = 'UNAVAILABLE';
  private base = `${environment.apiBaseUrl}/artisans`;

  constructor(private http: HttpClient, private auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    this.http.get<{ disponibilite: string }>(`${this.base}/${this.auth.getUserId()}`)
      .subscribe(a => (this.disponibilite = a.disponibilite));
  }

  basculer(statut: 'AVAILABLE_NOW' | 'UNAVAILABLE'): void {
    this.http.patch<{ disponibilite: string }>(`${this.base}/disponibilite`, {}, { params: { statut } })
      .subscribe(a => {
        this.disponibilite = a.disponibilite;
        this.toast.succes(statut === 'AVAILABLE_NOW' ? 'Vous apparaissez comme disponible.' : 'Vous êtes indisponible.');
      });
  }
}
