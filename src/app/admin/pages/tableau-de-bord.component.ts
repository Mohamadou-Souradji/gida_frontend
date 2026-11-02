import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { Alerte, TableauDeBord } from '../../shared/models/admin.model';
import { PointBarre } from '../composants/barres.component';

const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Vue d'ensemble : alertes, chiffres cles, evolution mensuelle, repartitions. */
@Component({
  selector: 'gj-admin-tableau-de-bord',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Tableau de bord' | t }}</h2>
        <p>{{ 'Vue d’ensemble de la plateforme : flux, litiges et vérifications.' | t }}</p>
      </div>
      <div class="page-entete__actions">
        <button type="button" class="btn-secondaire" (click)="charger()"><gj-icone nom="refresh" [taille]="16"></gj-icone>{{ 'Actualiser' | t }}</button>
      </div>
    </div>

    <ng-container *ngIf="tdb as d">
      <ul class="bo-alertes" *ngIf="d.alertes.length">
        <li *ngFor="let a of d.alertes" [class]="'bo-alerte bo-alerte--' + a.niveau">
          <span class="bo-alerte__icone" aria-hidden="true">
            <gj-icone [nom]="a.niveau === 'danger' ? 'alert' : a.niveau === 'warning' ? 'clock' : 'info'" [taille]="14"></gj-icone>
          </span>
          <span>{{ a.message }}</span>
          <a class="bo-alerte__lien" [routerLink]="chemin(a)" [queryParams]="parametres(a)">{{ 'Voir' | t }}<gj-icone nom="arrow-right" [taille]="14"></gj-icone></a>
        </li>
      </ul>
      <p class="info info--ok" *ngIf="!d.alertes.length">
        <gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Rien à signaler : aucun litige, aucun document en attente.' | t }}
      </p>

      <div class="tuiles tuiles--modernes">
        <div class="tuile tuile--accent">
          <span class="tuile__icone"><gj-icone nom="lock"></gj-icone></span>
          <span class="tuile__libelle">{{ 'Volume sécurisé' | t }}</span>
          <strong>{{ d.volumeSecuriseFcfa | fcfa }}</strong>
          <span class="tuile__aide">{{ 'payé par les clients sur le séquestre' | t }}</span>
        </div>
        <div class="tuile">
          <span class="tuile__icone"><gj-icone nom="layers"></gj-icone></span>
          <span class="tuile__libelle">{{ 'Bloqué en séquestre' | t }}</span>
          <strong>{{ d.enSequestreFcfa | fcfa }}</strong>
          <span class="tuile__aide">{{ 'reste à libérer (en cours + litiges)' | t }}</span>
        </div>
        <div class="tuile">
          <span class="tuile__icone tuile__icone--or"><gj-icone nom="wallet"></gj-icone></span>
          <span class="tuile__libelle">{{ 'Commissions gagnées' | t }}</span>
          <strong>{{ d.commissionsFcfa | fcfa }}</strong>
          <span class="tuile__aide">{{ 'sur' | t }} {{ d.libereFcfa | fcfa }} {{ 'libérés' | t }}</span>
        </div>
        <div class="tuile">
          <span class="tuile__icone"><gj-icone nom="banknote"></gj-icone></span>
          <span class="tuile__libelle">{{ 'Retraits Mobile Money' | t }}</span>
          <strong>{{ d.retraitsFcfa | fcfa }}</strong>
          <span class="tuile__aide">{{ 'versés aux utilisateurs' | t }}</span>
        </div>
        <div class="tuile">
          <span class="tuile__icone"><gj-icone nom="users"></gj-icone></span>
          <span class="tuile__libelle">{{ 'Utilisateurs' | t }}</span>
          <strong>{{ d.utilisateurs }}</strong>
          <span class="tuile__aide">+{{ d.nouveaux30j }} {{ 'en 30 jours' | t }} · {{ d.comptesSuspendus }} {{ 'suspendu(s)' | t }}</span>
        </div>
        <div class="tuile">
          <span class="tuile__icone"><gj-icone nom="briefcase"></gj-icone></span>
          <span class="tuile__libelle">{{ 'Projets' | t }}</span>
          <strong>{{ d.projets }}</strong>
          <span class="tuile__aide">{{ d.projetsPublies }} {{ 'publiés' | t }} · {{ d.projetsAvecPrestataire }} {{ 'avec prestataire' | t }}</span>
        </div>
        <a class="tuile tuile--lien" routerLink="/admin/litiges" [class.tuile--danger]="d.litigesOuverts > 0">
          <span class="tuile__icone tuile__icone--rouge"><gj-icone nom="scale"></gj-icone></span>
          <span class="tuile__libelle">{{ 'Litiges ouverts' | t }}</span>
          <strong>{{ d.litigesOuverts }}</strong>
          <span class="tuile__aide">{{ d.jalonsEnAttente }} {{ 'jalon(s) à valider par les clients' | t }}</span>
        </a>
        <a class="tuile tuile--lien" routerLink="/admin/kyc">
          <span class="tuile__icone"><gj-icone nom="user-check"></gj-icone></span>
          <span class="tuile__libelle">{{ 'KYC en attente' | t }}</span>
          <strong>{{ d.kycEnAttente }}</strong>
          <span class="tuile__aide">{{ d.appelsOffres }} AO · {{ d.produitsCatalogue }} {{ 'produits au catalogue' | t }}</span>
        </a>
      </div>

      <div class="bo-grille bo-grille--graphes">
        <div class="carte carte--graphe"><gj-barres [titre]="'Volume sécurisé par mois'" format="fcfa" [points]="serie('volumeFcfa')"></gj-barres></div>
        <div class="carte carte--graphe"><gj-barres [titre]="'Commissions par mois'" format="fcfa" [points]="serie('commissionsFcfa')"></gj-barres></div>
        <div class="carte carte--graphe"><gj-barres [titre]="'Inscriptions par mois'" [points]="serie('inscriptions')"></gj-barres></div>
        <div class="carte carte--graphe"><gj-barres [titre]="'Retraits par mois'" format="fcfa" [points]="serie('retraitsFcfa')"></gj-barres></div>
      </div>

      <div class="bo-grille">
        <section class="carte">
          <h3 class="carte-titre"><gj-icone nom="users"></gj-icone>{{ 'Utilisateurs par profil' | t }}</h3>
          <div class="repartition" *ngFor="let r of profils">
            <span class="repartition__libelle">{{ r.cle | libelle }}</span>
            <span class="repartition__piste"><span class="repartition__barre" [style.width.%]="r.part"></span></span>
            <span class="repartition__valeur">{{ r.valeur }}</span>
          </div>
        </section>
        <section class="carte">
          <h3 class="carte-titre"><gj-icone nom="shield"></gj-icone>{{ 'Niveaux KYC' | t }}</h3>
          <div class="repartition" *ngFor="let r of kycs">
            <span class="repartition__libelle">{{ r.cle | libelle }}</span>
            <span class="repartition__piste"><span class="repartition__barre" [style.width.%]="r.part"></span></span>
            <span class="repartition__valeur">{{ r.valeur }}</span>
          </div>
        </section>
      </div>

      <section class="carte">
        <h3 class="carte-titre"><gj-icone nom="lock"></gj-icone>{{ 'Séquestre par statut' | t }}</h3>
        <div class="tableau-carte">
          <table class="tableau-moderne">
            <thead>
              <tr><th>{{ 'Statut' | t }}</th><th class="nombre">{{ 'Contrats' | t }}</th><th class="nombre">{{ 'Montant' | t }}</th><th class="nombre"></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of d.sequestreParStatut" [class.inactif]="!s.nombre">
                <td><span [class]="s.statut | badge">{{ s.statut | libelle }}</span></td>
                <td class="nombre">{{ s.nombre }}</td>
                <td class="nombre">{{ s.montantFcfa | fcfa }}</td>
                <td class="nombre">
                  <a *ngIf="s.nombre" class="bouton-action bouton-action--lien" routerLink="/admin/transactions" [queryParams]="{ statut: s.statut }">
                    {{ 'Voir' | t }}<gj-icone nom="chevron-right" [taille]="14"></gj-icone>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <p class="aide maj"><gj-icone nom="clock" [taille]="14"></gj-icone>{{ 'Mis à jour le' | t }} {{ d.genereLe | date: 'dd/MM/yyyy à HH:mm' }}</p>
    </ng-container>
  `
})
export class TableauDeBordComponent implements OnInit {
  tdb: TableauDeBord | null = null;
  profils: { cle: string; valeur: number; part: number }[] = [];
  kycs: { cle: string; valeur: number; part: number }[] = [];
  private series: Record<string, PointBarre[]> = {};

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.admin.tableauDeBord().subscribe(d => {
      this.tdb = d;
      this.series = {};
      this.profils = this.repartition(d.utilisateursParProfil);
      this.kycs = this.repartition(d.utilisateursParKyc, false);
    });
  }

  /** Serie mensuelle memorisee (evite de recreer les points a chaque detection de changement). */
  serie(champ: 'volumeFcfa' | 'commissionsFcfa' | 'inscriptions' | 'retraitsFcfa'): PointBarre[] {
    if (!this.series[champ] && this.tdb) {
      this.series[champ] = this.tdb.serieMensuelle.map(p => ({
        cle: p.mois,
        libelle: MOIS_COURTS[Number(p.mois.slice(5, 7)) - 1],
        valeur: p[champ]
      }));
    }
    return this.series[champ] ?? [];
  }

  repartition(valeurs: Record<string, number>, trier = true): { cle: string; valeur: number; part: number }[] {
    const lignes = Object.entries(valeurs).map(([cle, valeur]) => ({ cle, valeur }));
    if (trier) {
      lignes.sort((a, b) => b.valeur - a.valeur);
    }
    const max = Math.max(...lignes.map(l => l.valeur), 1);
    return lignes.map(l => ({ ...l, part: (l.valeur / max) * 100 }));
  }

  chemin(a: Alerte): string {
    return a.lien.split('?')[0];
  }

  parametres(a: Alerte): Record<string, string> {
    const requete = a.lien.split('?')[1];
    const resultat: Record<string, string> = {};
    (requete ?? '').split('&').filter(Boolean).forEach(paire => {
      const [cle, valeur] = paire.split('=');
      resultat[decodeURIComponent(cle)] = decodeURIComponent(valeur ?? '');
    });
    return resultat;
  }
}
