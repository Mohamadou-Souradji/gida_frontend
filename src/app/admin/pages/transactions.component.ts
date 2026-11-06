import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import {
  PageAdmin, RetraitLigne, STATUTS_SEQUESTRE, TransactionDetail, TransactionLigne
} from '../../shared/models/admin.model';

/** Suivi de l'argent : contrats de sequestre (paiements, liberations, commissions) et retraits. */
@Component({
  selector: 'gj-admin-transactions',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Transactions' | t }}</h2>
        <p>{{ 'Flux du séquestre et retraits Mobile Money.' | t }}</p>
      </div>
    </div>

    <div class="onglets onglets--modernes" role="tablist">
      <button type="button" role="tab" [class.actif]="vue === 'sequestre'" (click)="changerVue('sequestre')">
        <gj-icone nom="lock" [taille]="15"></gj-icone>{{ 'Séquestre' | t }}
      </button>
      <button type="button" role="tab" [class.actif]="vue === 'retraits'" (click)="changerVue('retraits')">
        <gj-icone nom="banknote" [taille]="15"></gj-icone>{{ 'Retraits' | t }}
      </button>
    </div>

    <form class="filtres-bar" (ngSubmit)="rechercher()">
      <div class="champ-groupe champ-grow">
        <label for="q-tx">{{ 'Recherche' | t }}</label>
        <div class="champ-recherche">
          <gj-icone nom="search" [taille]="16"></gj-icone>
          <input id="q-tx" name="q" [(ngModel)]="q"
                 [placeholder]="vue === 'sequestre' ? ('Projet, téléphone ou référence' | t) : ('Téléphone ou référence' | t)" />
        </div>
      </div>
      <div class="champ-groupe" *ngIf="vue === 'sequestre'">
        <label for="statut-tx">{{ 'Statut' | t }}</label>
        <select id="statut-tx" name="statut" [(ngModel)]="statut" (change)="rechercher()">
          <option value="">{{ 'Tous' | t }}</option>
          <option *ngFor="let s of statuts" [value]="s">{{ s | libelle }}</option>
        </select>
      </div>
      <button type="submit"><gj-icone nom="filter" [taille]="16"></gj-icone>{{ 'Rechercher' | t }}</button>
      <button type="button" class="btn-secondaire" *ngIf="vue === 'sequestre' && admin.peut('FINANCES_EXPORTER')" (click)="exporter()">
        <gj-icone nom="download" [taille]="16"></gj-icone>{{ 'Exporter (CSV)' | t }}
      </button>
    </form>

    <ng-container *ngIf="vue === 'sequestre' && transactions">
      <div class="etat-vide" *ngIf="!transactions.elements.length">
        <div class="etat-vide__icone"><gj-icone nom="search" [taille]="24"></gj-icone></div>
        <h3>{{ 'Aucune transaction ne correspond.' | t }}</h3>
      </div>
      <div class="tableau-carte" *ngIf="transactions.elements.length">
        <table class="tableau-moderne">
          <thead>
            <tr>
              <th>{{ 'Date' | t }}</th><th>{{ 'Projet' | t }}</th><th>{{ 'Client' | t }}</th><th>{{ 'Prestataire' | t }}</th>
              <th class="nombre">{{ 'Montant' | t }}</th><th class="nombre">{{ 'Libéré' | t }}</th><th class="nombre">{{ 'Commissions' | t }}</th>
              <th>{{ 'Statut' | t }}</th><th></th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let t of transactions.elements">
              <tr>
                <td class="sous-texte">{{ t.createdAt | date: 'dd/MM/yyyy' }}</td>
                <td><a class="lien-titre" [routerLink]="['/admin/projets', t.projetId]">{{ t.projetTitre }}</a></td>
                <td>{{ t.payeur.nom }}<div class="sous-texte">{{ t.payeur.phone }}</div></td>
                <td>{{ t.beneficiaire.nom }}<div class="sous-texte">{{ t.beneficiaire.phone }}</div></td>
                <td class="nombre">{{ t.montantTotalFcfa | fcfa }}</td>
                <td class="nombre">{{ t.montantLibereFcfa | fcfa }}</td>
                <td class="nombre">{{ t.commissionsFcfa | fcfa }}</td>
                <td><span [class]="t.statut | badge">{{ t.statut | libelle }}</span></td>
                <td class="nombre">
                  <button type="button" class="bouton-action bouton-action--lien" (click)="basculer(t)">
                    <gj-icone [nom]="ouvert[t.id] ? 'chevron-left' : 'chevron-right'" [taille]="14"></gj-icone>{{ (ouvert[t.id] ? 'Masquer' : 'Détail') | t }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="ouvert[t.id] as det" class="sous-ligne">
                <td colspan="9">
                  <div class="detail-transaction">
                    <div class="chips">
                      <span class="chip"><gj-icone nom="wallet"></gj-icone>{{ t.operateurMobileMoney | libelle }}</span>
                      <span class="chip"><gj-icone nom="phone"></gj-icone>{{ t.numeroPayeur || '-' }}</span>
                      <span class="chip"><gj-icone nom="file"></gj-icone>{{ 'réf.' | t }} {{ t.referencePaiement || '-' }}</span>
                      <span class="chip"><gj-icone nom="activity"></gj-icone>{{ t.niveauCommission | libelle }}</span>
                      <span class="chip"><gj-icone nom="clock"></gj-icone>{{ 'mis à jour' | t }} {{ t.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <div class="alerte" *ngIf="t.motifLitige" style="margin-top:10px">
                      <gj-icone nom="alert" [taille]="16"></gj-icone>{{ 'Motif du litige' | t }} : {{ t.motifLitige }}
                    </div>
                    <table class="tableau-moderne tableau-moderne--imbrique">
                      <thead>
                        <tr><th>{{ 'Tranche' | t }}</th><th class="nombre">{{ 'Montant' | t }}</th><th class="nombre">{{ 'Commission' | t }}</th><th class="nombre">{{ 'Net versé' | t }}</th><th>{{ 'Libérée' | t }}</th></tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let tr of det.tranches">
                          <td>{{ tr.jalonLibelle || '-' }}</td>
                          <td class="nombre">{{ tr.montantFcfa | fcfa }}</td>
                          <td class="nombre">{{ tr.commissionFcfa | fcfa }}</td>
                          <td class="nombre">{{ tr.montantNetFcfa | fcfa }}</td>
                          <td>{{ tr.libere ? (tr.libereLe | date: 'dd/MM/yyyy HH:mm') : ('Non' | t) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>
      <gj-pagination [page]="page" [taille]="taille" [total]="transactions.total" (changer)="aller($event)"></gj-pagination>
    </ng-container>

    <ng-container *ngIf="vue === 'retraits' && retraits">
      <div class="etat-vide" *ngIf="!retraits.elements.length">
        <div class="etat-vide__icone"><gj-icone nom="banknote" [taille]="24"></gj-icone></div>
        <h3>{{ 'Aucun retrait.' | t }}</h3>
      </div>
      <div class="tableau-carte" *ngIf="retraits.elements.length">
        <table class="tableau-moderne">
          <thead>
            <tr><th>{{ 'Date' | t }}</th><th>{{ 'Utilisateur' | t }}</th><th>{{ 'Opérateur' | t }}</th><th>{{ 'Numéro crédité' | t }}</th><th class="nombre">{{ 'Montant' | t }}</th><th>{{ 'Référence' | t }}</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of retraits.elements">
              <td class="sous-texte">{{ r.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ r.utilisateur.nom }}<div class="sous-texte">{{ r.utilisateur.phone }} · {{ r.utilisateur.profileType | libelle }}</div></td>
              <td>{{ r.operateur | libelle }}</td>
              <td>{{ r.numero }}</td>
              <td class="nombre">{{ r.montantFcfa | fcfa }}</td>
              <td class="sous-texte">{{ r.reference || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <gj-pagination [page]="page" [taille]="taille" [total]="retraits.total" (changer)="aller($event)"></gj-pagination>
    </ng-container>
  `
})
export class TransactionsAdminComponent implements OnInit {
  statuts = STATUTS_SEQUESTRE;
  vue: 'sequestre' | 'retraits' = 'sequestre';
  q = '';
  statut = '';
  page = 0;
  taille = 20;
  transactions: PageAdmin<TransactionLigne> | null = null;
  retraits: PageAdmin<RetraitLigne> | null = null;
  ouvert: Record<string, TransactionDetail | undefined> = {};

  constructor(public admin: AdminService, private toast: ToastService,
              private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(p => {
      this.vue = p.get('vue') === 'retraits' ? 'retraits' : 'sequestre';
      this.q = p.get('q') ?? '';
      this.statut = p.get('statut') ?? '';
      this.page = Number(p.get('page') ?? 0);
      this.ouvert = {};
      if (this.vue === 'sequestre') {
        this.admin.transactions({ q: this.q, statut: this.statut, page: this.page, taille: this.taille })
          .subscribe(r => (this.transactions = r));
      } else {
        this.admin.retraits({ q: this.q, page: this.page, taille: this.taille }).subscribe(r => (this.retraits = r));
      }
    });
  }

  changerVue(vue: 'sequestre' | 'retraits'): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { vue: vue === 'retraits' ? vue : null } });
  }

  rechercher(): void {
    this.naviguer(0);
  }

  aller(page: number): void {
    this.naviguer(page);
  }

  basculer(t: TransactionLigne): void {
    if (this.ouvert[t.id]) {
      delete this.ouvert[t.id];
      return;
    }
    this.admin.transaction(t.id).subscribe(d => (this.ouvert[t.id] = d));
  }

  exporter(): void {
    this.admin.exporterTransactions({ q: this.q, statut: this.statut }).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gida-jari-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.toast.succes('Export téléchargé.');
    });
  }

  private naviguer(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        vue: this.vue === 'retraits' ? 'retraits' : null,
        q: this.q || null,
        statut: this.vue === 'sequestre' && this.statut ? this.statut : null,
        page: page || null
      }
    });
  }
}
