import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '../client.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Jalon, ProjetVue } from '../../../shared/models/projet.model';
import { ETATS_FINANCES, ETATS_TERMINES, OPERATEURS_MOBILE_MONEY } from '../../../shared/models/escrow.model';
import { Utilisateur } from '../../../shared/models/user.model';

/**
 * Detail d'un chantier cote client :
 *  1. brouillon : publication, ajout / suppression de jalons ;
 *  2. publie : choix et engagement d'un artisan ou d'une entreprise BTP ;
 *  3. sequestre DRAFT : paiement Mobile Money vers le compte de sequestre (regle n1) ;
 *  4. sequestre alimente : validation / rejet des preuves photo GPS (regle n3 : 48h), litige ;
 *  5. termine : notation du prestataire.
 */
@Component({
  selector: 'gj-projet-detail',
  template: `
    <a class="retour-lien" routerLink="/client"><gj-icone nom="arrow-left" [taille]="16"></gj-icone>{{ 'Retour' | t }}</a>

    <ng-container *ngIf="vue as v">
      <div class="page-entete">
        <div>
          <h2>{{ v.projet.titre }}</h2>
          <div class="chips">
            <span class="chip"><gj-icone nom="layers"></gj-icone>{{ v.projet.typeProjet }}</span>
            <span class="chip"><gj-icone nom="map-pin"></gj-icone>{{ v.projet.localisation }}</span>
            <span class="chip"><gj-icone nom="wallet"></gj-icone>{{ 'Budget estimé (FCFA)' | t }} : {{ v.projet.budgetEstimeFcfa | fcfa }}</span>
          </div>
        </div>
        <span *ngIf="v.escrow" [class]="v.escrow.statut | badge">{{ v.escrow.statut | libelle }}</span>
      </div>

      <p class="description-projet" *ngIf="v.projet.description">{{ v.projet.description }}</p>

      <div class="kpi-grille">
        <div class="kpi">
          <span class="kpi__icone"><gj-icone nom="layers"></gj-icone></span>
          <div><div class="kpi__valeur">{{ totalJalons() | fcfa }}</div><div class="kpi__libelle">{{ 'Total des jalons' | t }}</div></div>
        </div>
        <div class="kpi kpi--vert">
          <span class="kpi__icone"><gj-icone nom="check"></gj-icone></span>
          <div><div class="kpi__valeur">{{ jalonsValides() }} / {{ v.projet.jalons.length }}</div><div class="kpi__libelle">{{ 'Jalons validés' | t }}</div></div>
        </div>
        <div class="kpi kpi--or">
          <span class="kpi__icone"><gj-icone nom="lock"></gj-icone></span>
          <div><div class="kpi__valeur">{{ v.escrow?.montantTotalFcfa | fcfa }}</div><div class="kpi__libelle">{{ 'Séquestre' | t }}</div></div>
        </div>
      </div>

      <!-- 1. Brouillon -->
      <section class="carte-section" *ngIf="!v.projet.publie">
        <div class="info"><gj-icone nom="info" [taille]="16"></gj-icone>&nbsp;{{ 'Ce projet est un brouillon : il n’est pas visible des prestataires.' | t }}</div>
        <div class="actions actions--fin">
          <button type="button" (click)="publier()"><gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Publier' | t }}</button>
        </div>
      </section>

      <!-- Jalons -->
      <section class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="layers"></gj-icone>{{ 'Jalons' | t }}</h3>
        </div>
        <div class="tableau-carte">
          <table class="tableau-moderne">
            <thead>
              <tr>
                <th>{{ 'Jalon' | t }}</th>
                <th class="nombre">{{ 'Montant' | t }}</th>
                <th>{{ 'Statut' | t }}</th>
                <th class="nombre">{{ 'Actions' | t }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let j of jalonsTries()">
                <td>
                  <div class="jalon-titre">
                    <span class="jalon-num">{{ j.ordre }}</span>
                    <div>
                      <strong>{{ j.libelle }}</strong>
                      <div *ngIf="j.statut === 'SOUMIS'" class="info info--compact">
                        {{ 'Soumis le' | t }} {{ j.soumisLe | date: 'dd/MM HH:mm' }} · {{ 'validation automatique 48h après sans réponse.' | t }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="nombre">{{ j.montantFcfa | fcfa }}</td>
                <td><span [class]="j.statut | badge">{{ j.statut | libelle }}</span></td>
                <td class="nombre">
                  <div class="actions">
                    <a *ngIf="j.preuvePhotoUrls" class="bouton-action bouton-action--lien" [href]="j.preuvePhotoUrls | fichier" target="_blank">
                      <gj-icone nom="image" [taille]="15"></gj-icone>{{ 'Photo' | t }}
                    </a>
                    <a *ngIf="j.latitude" class="bouton-action bouton-action--lien"
                       [href]="'https://www.openstreetmap.org/?mlat=' + j.latitude + '&mlon=' + j.longitude + '#map=18/' + j.latitude + '/' + j.longitude" target="_blank">
                      <gj-icone nom="navigation" [taille]="15"></gj-icone>GPS
                    </a>
                    <ng-container *ngIf="j.statut === 'SOUMIS' && finance()">
                      <button type="button" class="bouton-action btn-success" (click)="valider(j)">
                        <gj-icone nom="check" [taille]="15"></gj-icone>{{ 'Valider' | t }}
                      </button>
                      <button type="button" class="bouton-action btn-danger" (click)="rejeter(j)">
                        <gj-icone nom="x" [taille]="15"></gj-icone>{{ 'Rejeter' | t }}
                      </button>
                    </ng-container>
                    <button *ngIf="!v.escrow" type="button" class="bouton-action bouton-action--discret"
                            (click)="supprimerJalon(j)" [attr.aria-label]="'Supprimer' | t" [title]="'Supprimer' | t">
                      <gj-icone nom="trash" [taille]="15"></gj-icone>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!v.projet.jalons.length">
                <td colspan="4"><p class="vide">{{ 'Aucun jalon pour le moment.' | t }}</p></td>
              </tr>
            </tbody>
          </table>
        </div>

        <form *ngIf="!v.escrow" [formGroup]="jalonForm" (ngSubmit)="ajouterJalon()" class="ajout-jalon">
          <div class="champ-groupe">
            <label>{{ 'Nouveau jalon' | t }}</label>
            <input formControlName="libelle" [placeholder]="'Ex : Fondations' | t" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Montant FCFA' | t }}</label>
            <input type="number" formControlName="montantFcfa" />
          </div>
          <button type="submit" [disabled]="jalonForm.invalid">
            <gj-icone nom="plus" [taille]="16"></gj-icone>{{ 'Ajouter' | t }}
          </button>
        </form>
      </section>

      <!-- 2. Engagement d'un prestataire -->
      <section class="carte-section" *ngIf="v.projet.publie && !v.escrow">
        <div class="carte-section__entete">
          <h3><gj-icone nom="users"></gj-icone>{{ 'Engager un prestataire' | t }}</h3>
        </div>
        <div class="onglets--modernes" role="tablist">
          <button type="button" role="tab" [class.actif]="ongletPrestataire === 'artisans'" (click)="ongletPrestataire = 'artisans'">{{ 'Artisans' | t }}</button>
          <button type="button" role="tab" [class.actif]="ongletPrestataire === 'entreprises'" (click)="chargerEntreprises()">{{ 'Entreprises BTP' | t }}</button>
        </div>

        <form *ngIf="ongletPrestataire === 'artisans'" class="recherche" (ngSubmit)="rechercherArtisans()">
          <div class="champ-recherche">
            <gj-icone nom="briefcase" [taille]="16"></gj-icone>
            <input [(ngModel)]="metier" name="metier" [placeholder]="'Corps de métier' | t" />
          </div>
          <div class="champ-recherche">
            <gj-icone nom="map-pin" [taille]="16"></gj-icone>
            <input [(ngModel)]="zone" name="zone" [placeholder]="'Zone d’intervention' | t" />
          </div>
          <button type="submit"><gj-icone nom="search" [taille]="16"></gj-icone>{{ 'Rechercher' | t }}</button>
        </form>

        <div class="etat-vide" *ngIf="prestataires.length === 0">
          <p>{{ 'Lancez une recherche pour trouver un prestataire.' | t }}</p>
        </div>

        <ul class="prestataires" *ngIf="prestataires.length">
          <li *ngFor="let p of prestataires" class="prestataire">
            <span class="prestataire__avatar"><gj-icone nom="user"></gj-icone></span>
            <div class="prestataire__infos">
              <strong>{{ p | nom }}</strong>
              <div class="chips">
                <span class="chip"><gj-icone nom="briefcase"></gj-icone>{{ p.corpsDeMetier || p['domaineActivite'] }}</span>
                <span class="chip"><gj-icone nom="map-pin"></gj-icone>{{ p.zoneIntervention }}</span>
                <span class="chip"><gj-icone nom="star" [taille]="14" class="icone--or"></gj-icone>{{ p.profileScore | number: '1.1-1' }}</span>
                <span class="chip"><gj-icone nom="shield"></gj-icone>KYC {{ p.kycLevel | libelle }}</span>
                <span *ngIf="p.disponibilite" [class]="p.disponibilite | badge">{{ p.disponibilite | libelle }}</span>
              </div>
            </div>
            <div class="prestataire__actions">
              <a class="btn btn-secondaire" [routerLink]="['/compte/messagerie']" [queryParams]="{ a: p.id, projet: v.projet.id }">
                <gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Écrire' | t }}
              </a>
              <button type="button" (click)="engager(p)"><gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Engager' | t }}</button>
            </div>
          </li>
        </ul>
        <p class="aide"><gj-icone nom="info" [taille]="14"></gj-icone>&nbsp;{{ 'Le prestataire doit avoir une pièce d’identité vérifiée (KYC niveau 3) pour recevoir des fonds.' | t }}</p>
      </section>

      <!-- 3. Paiement en sequestre -->
      <section class="carte-section" *ngIf="v.escrow?.statut === 'DRAFT'">
        <div class="carte-section__entete">
          <h3><gj-icone nom="wallet"></gj-icone>{{ 'Payer par Mobile Money' | t }}</h3>
        </div>
        <p>{{ 'Prestataire engagé' | t }} : <strong>{{ v.escrow?.beneficiaire | nom }}</strong>.
          {{ 'Le montant total' | t }} ({{ v.escrow?.montantTotalFcfa | fcfa }}) {{ 'est bloqué chez Gida Jari et versé jalon par jalon, uniquement après votre validation.' | t }}</p>
        <form [formGroup]="paiementForm" (ngSubmit)="payer()" class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Opérateur' | t }}</label>
            <select formControlName="operateur">
              <option *ngFor="let o of operateurs" [value]="o">{{ o | libelle }}</option>
            </select>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Numéro Mobile Money' | t }}</label>
            <input formControlName="numero" type="tel" />
          </div>
          <div class="champ-large actions-droite">
            <button type="submit" class="btn-success" [disabled]="paiementForm.invalid || envoi">
              <gj-icone nom="wallet" [taille]="16"></gj-icone>{{ 'Payer' | t }} {{ v.escrow?.montantTotalFcfa | fcfa }}
            </button>
          </div>
        </form>
      </section>
      <p class="info" *ngIf="v.escrow?.statut === 'PENDING_PAYMENT'">
        <gj-icone nom="clock" [taille]="16"></gj-icone>&nbsp;{{ 'Paiement en attente de confirmation par l’opérateur.' | t }}
      </p>

      <!-- 4. Suivi -->
      <section class="carte-section" *ngIf="v.escrow && v.escrow.statut !== 'DRAFT'">
        <div class="carte-section__entete">
          <h3><gj-icone nom="lock"></gj-icone>{{ 'Séquestre' | t }}</h3>
          <span [class]="v.escrow.statut | badge">{{ v.escrow.statut | libelle }}</span>
        </div>
        <div class="chips">
          <span class="chip"><gj-icone nom="user-check"></gj-icone>{{ 'Prestataire' | t }} : {{ v.escrow.beneficiaire | nom }}</span>
          <span class="chip"><gj-icone nom="lock"></gj-icone>{{ 'Bloqué' | t }} : {{ v.escrow.montantTotalFcfa | fcfa }}</span>
          <span class="chip"><gj-icone nom="check"></gj-icone>{{ 'Versé' | t }} : {{ v.escrow.montantLibereFcfa | fcfa }}</span>
        </div>
        <p class="alerte" *ngIf="v.escrow.statut === 'DISPUTED'" style="margin-top:14px">
          <gj-icone nom="alert" [taille]="16"></gj-icone>&nbsp;{{ 'Litige en cours d’arbitrage' | t }} : {{ v.escrow.motifLitige }}
        </p>
        <div class="actions actions--fin">
          <a class="btn btn-secondaire" [routerLink]="['/compte/messagerie']" [queryParams]="{ a: v.escrow.beneficiaire.id, projet: v.projet.id }">
            <gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Écrire au prestataire' | t }}
          </a>
          <button type="button" class="btn-danger" *ngIf="finance()" (click)="litige()">
            <gj-icone nom="alert" [taille]="16"></gj-icone>{{ 'Ouvrir un litige' | t }}
          </button>
        </div>
      </section>

      <!-- 5. Notation -->
      <gj-notation-form *ngIf="termine() && !notee" [projetId]="v.projet.id" [notePourId]="v.escrow!.beneficiaire.id"
        [nomCible]="(v.escrow!.beneficiaire | nom)" (notee)="notee = true"></gj-notation-form>
    </ng-container>
  `
})
export class ProjetDetailComponent implements OnInit {
  vue: ProjetVue | null = null;
  operateurs = OPERATEURS_MOBILE_MONEY;
  ongletPrestataire: 'artisans' | 'entreprises' = 'artisans';
  prestataires: Utilisateur[] = [];
  metier = '';
  zone = '';
  envoi = false;
  notee = false;
  private projetId = '';

  jalonForm = this.fb.nonNullable.group({
    libelle: ['', Validators.required],
    montantFcfa: [0, [Validators.required, Validators.min(1)]]
  });

  paiementForm = this.fb.nonNullable.group({
    operateur: ['AMANA', Validators.required],
    numero: ['', Validators.required]
  });

  constructor(private route: ActivatedRoute, private clientService: ClientService, private api: ApiService,
              private auth: AuthService, private toast: ToastService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.projetId = this.route.snapshot.paramMap.get('id') ?? '';
    this.charger();
    // Numero Mobile Money pre-rempli avec le telephone du compte (modifiable).
    this.auth.rafraichirCompte().subscribe(c => {
      if (!this.paiementForm.value.numero) {
        this.paiementForm.patchValue({ numero: c.phone });
      }
    });
  }

  charger(): void {
    this.api.projet(this.projetId).subscribe(v => {
      this.vue = v;
      if (v.projet.publie && !v.escrow && !this.prestataires.length) {
        this.rechercherArtisans();
      }
    });
  }

  jalonsTries(): Jalon[] {
    return [...(this.vue?.projet.jalons ?? [])].sort((a, b) => a.ordre - b.ordre);
  }

  jalonsValides(): number {
    return (this.vue?.projet.jalons ?? []).filter(j => j.statut === 'VALIDE').length;
  }

  totalJalons(): number {
    return (this.vue?.projet.jalons ?? []).reduce((s, j) => s + j.montantFcfa, 0);
  }

  finance(): boolean {
    return !!this.vue?.escrow && ETATS_FINANCES.includes(this.vue.escrow.statut);
  }

  termine(): boolean {
    return !!this.vue?.escrow && ETATS_TERMINES.includes(this.vue.escrow.statut);
  }

  publier(): void {
    this.clientService.publierProjet(this.projetId).subscribe(() => {
      this.toast.succes('Projet publié : les prestataires peuvent le voir.');
      this.charger();
    });
  }

  ajouterJalon(): void {
    this.clientService.ajouterJalons(this.projetId, [this.jalonForm.getRawValue()]).subscribe(() => {
      this.jalonForm.reset({ libelle: '', montantFcfa: 0 });
      this.charger();
    });
  }

  supprimerJalon(j: Jalon): void {
    this.clientService.supprimerJalon(j.id).subscribe(() => this.charger());
  }

  rechercherArtisans(): void {
    this.ongletPrestataire = 'artisans';
    this.api.rechercherArtisans(this.metier, this.zone).subscribe(r => (this.prestataires = r));
  }

  chargerEntreprises(): void {
    this.ongletPrestataire = 'entreprises';
    this.api.entreprisesBtp().subscribe(r => (this.prestataires = r));
  }

  engager(p: Utilisateur): void {
    this.clientService.engager(this.projetId, p.id).subscribe(() => {
      this.toast.succes('Prestataire engagé. Alimentez maintenant le séquestre.');
      this.charger();
    });
  }

  payer(): void {
    const escrow = this.vue?.escrow;
    if (!escrow) {
      return;
    }
    const { operateur, numero } = this.paiementForm.getRawValue();
    this.envoi = true;
    this.clientService.payer(escrow.id, operateur, numero).subscribe({
      next: t => {
        this.envoi = false;
        this.toast.succes(t.statut === 'FUNDED' ? 'Fonds sécurisés dans le séquestre.' : 'Paiement en attente de confirmation.');
        this.charger();
      },
      error: () => (this.envoi = false)
    });
  }

  valider(j: Jalon): void {
    this.clientService.validerJalon(j.id).subscribe(() => {
      this.toast.succes(`« ${j.libelle} » validé : le prestataire est payé.`);
      this.charger();
    });
  }

  rejeter(j: Jalon): void {
    const motif = prompt('Pourquoi refusez-vous ce jalon ?');
    if (motif) {
      this.clientService.rejeterJalon(j.id, motif).subscribe(() => this.charger());
    }
  }

  litige(): void {
    const motif = prompt('Motif du litige :');
    if (motif && this.vue?.escrow) {
      this.api.ouvrirLitige(this.vue.escrow.id, motif).subscribe(() => {
        this.toast.info('Litige ouvert. Un administrateur va arbitrer.');
        this.charger();
      });
    }
  }
}
