import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngService } from '../ong.service';
import { ToastService } from '../../../core/services/toast.service';
import { CandidatureAO } from '../../../shared/models/projet.model';

/** Consultation et depouillement des candidatures recues a un AO (roadmap 50% ONG). */
@Component({
  selector: 'gj-candidatures',
  template: `
    <a class="retour-lien" routerLink="/ong"><gj-icone nom="arrow-left" [taille]="16"></gj-icone>{{ 'Retour' | t }}</a>
    <div class="page-entete">
      <div>
        <h2>{{ 'Candidatures reçues' | t }}</h2>
        <p>{{ 'Évaluez les candidats puis retenez l’offre la plus adaptée.' | t }}</p>
      </div>
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !candidatures.length">
      <div class="etat-vide__icone"><gj-icone nom="users" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun élément' | t }}</h3>
      <p>{{ 'Les candidatures apparaîtront ici dès qu’un prestataire répond.' | t }}</p>
    </div>

    <article class="carte-section" *ngFor="let c of candidatures">
      <header class="carte-section__entete">
        <div>
          <h3 class="mission__titre">{{ c.candidat | nom }}</h3>
          <div class="chips">
            <span class="chip"><gj-icone nom="briefcase"></gj-icone>{{ c.candidat['domaineActivite'] }}</span>
            <span class="chip"><gj-icone nom="users"></gj-icone>{{ 'Effectif' | t }} {{ c.candidat['effectif'] ?? '-' }}</span>
            <span class="chip"><gj-icone nom="star" [taille]="14" class="icone--or"></gj-icone>{{ c.candidat.profileScore | number: '1.1-1' }}</span>
            <span class="chip"><gj-icone nom="shield"></gj-icone>KYC {{ c.candidat.kycLevel | libelle }}</span>
          </div>
        </div>
        <span [class]="c.statut | badge">{{ c.statut | libelle }}</span>
      </header>

      <p class="pre proposition__description">{{ c.propositionTechnique }}</p>

      <div class="kpi-grille kpi-grille--compacte">
        <div class="kpi kpi--or">
          <span class="kpi__icone"><gj-icone nom="wallet"></gj-icone></span>
          <div><div class="kpi__valeur">{{ c.montantPropositionFcfa | fcfa }}</div><div class="kpi__libelle">{{ 'Montant proposé' | t }}</div></div>
        </div>
      </div>

      <div class="actions actions--fin" *ngIf="c.statut === 'SOUMISE' || c.statut === 'EN_EVALUATION'">
        <a class="btn btn-secondaire" [routerLink]="['/compte/messagerie']" [queryParams]="{ a: c.candidat.id }">
          <gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Écrire' | t }}
        </a>
        <button type="button" class="btn-secondaire" *ngIf="c.statut === 'SOUMISE'" (click)="statuer(c, 'EN_EVALUATION')">
          <gj-icone nom="clock" [taille]="16"></gj-icone>{{ 'En évaluation' | t }}
        </button>
        <button type="button" class="btn-danger" (click)="statuer(c, 'REJETEE')">
          <gj-icone nom="x" [taille]="16"></gj-icone>{{ 'Rejeter' | t }}
        </button>
        <button type="button" class="btn-success" (click)="statuer(c, 'RETENUE')">
          <gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Retenir' | t }}
        </button>
      </div>
    </article>
  `
})
export class CandidaturesComponent implements OnInit {
  candidatures: CandidatureAO[] = [];
  charge = false;
  private appelOffreId = '';

  constructor(private route: ActivatedRoute, private ongService: OngService, private toast: ToastService) {}

  ngOnInit(): void {
    this.appelOffreId = this.route.snapshot.paramMap.get('appelOffreId') ?? '';
    this.charger();
  }

  charger(): void {
    this.ongService.consulterCandidatures(this.appelOffreId).subscribe(res => {
      this.candidatures = res;
      this.charge = true;
    });
  }

  statuer(c: CandidatureAO, statut: string): void {
    if (statut === 'RETENUE' && !confirm('Retenir cette candidature attribue l\'appel d\'offres et rejette les autres. Continuer ?')) {
      return;
    }
    this.ongService.statuerSurCandidature(c.id, statut).subscribe(() => {
      this.toast.succes('Décision enregistrée et notifiée au candidat.');
      this.charger();
    });
  }
}
