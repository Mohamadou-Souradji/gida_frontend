import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Jalon, ProjetVue } from '../models/projet.model';
import { ETATS_FINANCES, ETATS_TERMINES } from '../models/escrow.model';

/**
 * Missions d'un prestataire (artisan ou entreprise BTP) : chantiers engages,
 * etat du sequestre, et envoi de preuve photo geolocalisee GPS par jalon
 * (roadmap 50% profil Artisan). Notation du client en fin de chantier.
 */
@Component({
  selector: 'gj-missions',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Mes missions' | t }}</h2>
        <p>{{ 'Chantiers engagés, jalons à valider et preuves à transmettre.' | t }}</p>
      </div>
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !missions.length">
      <div class="etat-vide__icone"><gj-icone nom="briefcase" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucune mission pour le moment' | t }}</h3>
      <p>{{ 'Un client vous engage depuis son projet. Complétez votre profil et votre KYC niveau 3 pour être engageable.' | t }}</p>
    </div>

    <article class="carte-section mission" *ngFor="let m of missions">
      <header class="carte-section__entete">
        <div>
          <h3 class="mission__titre">{{ m.projet.titre }}</h3>
          <div class="chips">
            <span class="chip"><gj-icone nom="map-pin"></gj-icone>{{ m.projet.localisation }}</span>
            <span class="chip"><gj-icone nom="user"></gj-icone>{{ 'Client' | t }} : {{ m.projet.client | nom }}</span>
          </div>
        </div>
        <span [class]="m.escrow?.statut | badge">{{ m.escrow?.statut | libelle }}</span>
      </header>

      <div class="info" *ngIf="m.escrow?.statut === 'DRAFT' || m.escrow?.statut === 'PENDING_PAYMENT'">
        <gj-icone nom="clock" [taille]="16"></gj-icone>
        {{ 'En attente du paiement du client dans le séquestre. Ne démarrez pas avant « Fonds sécurisés ».' | t }}
      </div>

      <div class="kpi-grille kpi-grille--compacte" *ngIf="m.escrow">
        <div class="kpi kpi--or">
          <span class="kpi__icone"><gj-icone nom="lock"></gj-icone></span>
          <div><div class="kpi__valeur">{{ m.escrow.montantTotalFcfa | fcfa }}</div><div class="kpi__libelle">{{ 'Séquestre' | t }}</div></div>
        </div>
        <div class="kpi kpi--vert">
          <span class="kpi__icone"><gj-icone nom="wallet"></gj-icone></span>
          <div><div class="kpi__valeur">{{ m.escrow.montantLibereFcfa | fcfa }}</div><div class="kpi__libelle">{{ 'Libéré' | t }}</div></div>
        </div>
      </div>

      <div class="tableau-carte">
        <table class="tableau-moderne">
          <thead>
            <tr><th>{{ 'Jalon' | t }}</th><th class="nombre">{{ 'Montant' | t }}</th><th>{{ 'Statut' | t }}</th><th class="nombre">{{ 'Actions' | t }}</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let j of trier(m.projet.jalons)">
              <td>
                <div class="jalon-titre">
                  <span class="jalon-num">{{ j.ordre }}</span>
                  <div>
                    <strong>{{ j.libelle }}</strong>
                    <div *ngIf="j.commentaireClient" class="alerte alerte--compacte">
                      <gj-icone nom="alert" [taille]="14"></gj-icone>{{ 'Refusé' | t }} : {{ j.commentaireClient }}
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
                  <button *ngIf="peutSoumettre(m, j)" type="button" class="bouton-action btn-warning" (click)="ouvrir(j)">
                    <gj-icone nom="send" [taille]="15"></gj-icone>{{ 'Envoyer une preuve' | t }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form *ngIf="jalonOuvert && appartient(m, jalonOuvert.id)" class="preuve" (ngSubmit)="envoyerPreuve()">
        <div class="carte-section__entete">
          <h4 class="preuve__titre"><gj-icone nom="image"></gj-icone>{{ 'Preuve pour' | t }} « {{ jalonOuvert.libelle }} »</h4>
        </div>

        <div class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Photo' | t }} <span class="aide-champ">({{ 'prise sur le chantier' | t }})</span></label>
            <input class="champ-fichier" type="file" accept="image/*" capture="environment" (change)="choisirPhoto($event)" />
            <span *ngIf="photoUrl" class="badge badge-success preuve__ok"><gj-icone nom="check" [taille]="14"></gj-icone>{{ 'Photo téléversée' | t }}</span>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Position GPS' | t }}</label>
            <button type="button" class="btn-secondaire preuve__gps" (click)="positionGps()">
              <gj-icone nom="navigation" [taille]="16"></gj-icone>{{ 'Utiliser ma position GPS' | t }}
            </button>
            <span *ngIf="latitude !== null" class="aide-champ">
              {{ latitude | number: '1.5-5' }}, {{ longitude | number: '1.5-5' }}
            </span>
          </div>
        </div>

        <div class="actions actions--fin">
          <button type="button" class="btn-secondaire" (click)="jalonOuvert = null">{{ 'Annuler' | t }}</button>
          <button type="submit" class="btn-success" [disabled]="!photoUrl || latitude === null || envoi">
            <gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Envoyer' | t }}
          </button>
        </div>
      </form>

      <div class="actions actions--fin" *ngIf="m.escrow">
        <a class="btn btn-secondaire" [routerLink]="['/compte/messagerie']" [queryParams]="{ a: m.projet.client?.id, projet: m.projet.id }">
          <gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Écrire au client' | t }}
        </a>
        <button type="button" class="btn-danger" *ngIf="finance(m)" (click)="litige(m)">
          <gj-icone nom="alert" [taille]="16"></gj-icone>{{ 'Ouvrir un litige' | t }}
        </button>
      </div>
      <div class="alerte" *ngIf="m.escrow?.statut === 'DISPUTED'" style="margin-top:12px">
        <gj-icone nom="alert" [taille]="16"></gj-icone>{{ 'Litige en cours d’arbitrage' | t }} : {{ m.escrow?.motifLitige }}
      </div>

      <gj-notation-form *ngIf="termine(m) && !notes[m.projet.id]" [projetId]="m.projet.id"
        [notePourId]="m.projet.client?.id ?? ''" [nomCible]="(m.projet.client | nom)"
        (notee)="notes[m.projet.id] = true"></gj-notation-form>
    </article>
  `
})
export class MissionsComponent implements OnInit {
  missions: ProjetVue[] = [];
  charge = false;
  jalonOuvert: Jalon | null = null;
  photoUrl = '';
  latitude: number | null = null;
  longitude: number | null = null;
  envoi = false;
  notes: Record<string, boolean> = {};

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.api.missions().subscribe(res => {
      this.missions = res;
      this.charge = true;
    });
  }

  trier(jalons: Jalon[]): Jalon[] {
    return [...jalons].sort((a, b) => a.ordre - b.ordre);
  }

  finance(m: ProjetVue): boolean {
    return !!m.escrow && ETATS_FINANCES.includes(m.escrow.statut);
  }

  termine(m: ProjetVue): boolean {
    return !!m.escrow && ETATS_TERMINES.includes(m.escrow.statut);
  }

  peutSoumettre(m: ProjetVue, j: Jalon): boolean {
    return this.finance(m) && (j.statut === 'A_FAIRE' || j.statut === 'REJETE');
  }

  appartient(m: ProjetVue, jalonId: string): boolean {
    return m.projet.jalons.some(j => j.id === jalonId);
  }

  ouvrir(j: Jalon): void {
    this.jalonOuvert = j;
    this.photoUrl = '';
    this.latitude = null;
    this.longitude = null;
    this.positionGps();
  }

  choisirPhoto(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (fichier) {
      this.api.uploader(fichier).subscribe(url => (this.photoUrl = url));
    }
  }

  positionGps(): void {
    if (!navigator.geolocation) {
      this.toast.erreur('GPS indisponible sur cet appareil.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
      },
      () => this.toast.erreur('Position GPS refusée ou indisponible : activez la localisation.'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  envoyerPreuve(): void {
    if (!this.jalonOuvert || this.latitude === null || this.longitude === null) {
      return;
    }
    this.envoi = true;
    this.api.soumettrePreuve(this.jalonOuvert.id, this.photoUrl, this.latitude, this.longitude).subscribe({
      next: () => {
        this.toast.succes('Preuve envoyée. Le client a 48h pour valider.');
        this.jalonOuvert = null;
        this.envoi = false;
        this.charger();
      },
      error: () => (this.envoi = false)
    });
  }

  litige(m: ProjetVue): void {
    const motif = prompt('Motif du litige :');
    if (motif && m.escrow) {
      this.api.ouvrirLitige(m.escrow.id, motif).subscribe(() => {
        this.toast.info('Litige ouvert. Un administrateur va arbitrer.');
        this.charger();
      });
    }
  }
}
