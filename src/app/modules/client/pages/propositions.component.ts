import { Component, OnInit } from '@angular/core';
import { ClientService } from '../client.service';
import { ToastService } from '../../../core/services/toast.service';
import { PropositionEtude } from '../../../shared/models/projet.model';

/** Propositions d'etudes recues des ingenieurs / architectes, decoupees en phases. */
@Component({
  selector: 'gj-client-propositions',
  template: `
    <a class="retour-lien" routerLink="/client"><gj-icone nom="arrow-left" [taille]="16"></gj-icone>{{ 'Retour' | t }}</a>
    <div class="page-entete">
      <div>
        <h2>{{ 'Propositions d’études' | t }}</h2>
        <p>{{ 'Études reçues des ingénieurs et architectes, découpées en phases.' | t }}</p>
      </div>
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !propositions.length">
      <div class="etat-vide__icone"><gj-icone nom="file" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun élément' | t }}</h3>
      <p>{{ 'Les propositions d’études de vos projets apparaîtront ici.' | t }}</p>
    </div>

    <article class="carte-section" *ngFor="let p of propositions">
      <header class="carte-section__entete">
        <div>
          <h3 class="proposition__titre">{{ p.titre }}</h3>
          <div class="chips">
            <span class="chip"><gj-icone nom="briefcase"></gj-icone>{{ p.projet.titre }}</span>
            <span class="chip"><gj-icone nom="user"></gj-icone>{{ p.expert | nom }}</span>
          </div>
        </div>
        <span [class]="p.statut | badge">{{ p.statut | libelle }}</span>
      </header>

      <p class="proposition__description" *ngIf="p.description">{{ p.description }}</p>

      <div class="tableau-carte">
        <table class="tableau-moderne">
          <thead>
            <tr><th>{{ 'Phase' | t }}</th><th class="nombre">{{ 'Montant' | t }}</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let ph of p.phases">
              <td><div class="jalon-titre"><span class="jalon-num">{{ ph.ordre }}</span><span>{{ ph.libelle }}</span></div></td>
              <td class="nombre">{{ ph.montantFcfa | fcfa }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><th>{{ 'Total' | t }}</th><th class="nombre">{{ p.montantTotalFcfa | fcfa }}</th></tr>
          </tfoot>
        </table>
      </div>

      <div class="actions actions--fin" *ngIf="p.statut === 'ENVOYEE'">
        <a class="btn btn-secondaire" [routerLink]="['/compte/messagerie']" [queryParams]="{ a: p.expert.id, projet: p.projet.id }">
          <gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Écrire' | t }}
        </a>
        <button type="button" class="btn-danger" (click)="decider(p, 'refuser')">
          <gj-icone nom="x" [taille]="16"></gj-icone>{{ 'Refuser' | t }}
        </button>
        <button type="button" class="btn-success" (click)="decider(p, 'accepter')">
          <gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Accepter' | t }}
        </button>
      </div>
    </article>
    `
})
export class PropositionsComponent implements OnInit {
  propositions: PropositionEtude[] = [];
  charge = false;

  constructor(private clientService: ClientService, private toast: ToastService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.clientService.propositions().subscribe(r => {
      this.propositions = r;
      this.charge = true;
    });
  }

  decider(p: PropositionEtude, decision: 'accepter' | 'refuser'): void {
    this.clientService.deciderProposition(p.id, decision).subscribe(() => {
      this.toast.succes(decision === 'accepter' ? 'Proposition acceptée.' : 'Proposition refusée.');
      this.charger();
    });
  }
}
