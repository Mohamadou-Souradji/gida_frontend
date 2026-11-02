import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

/**
 * KYC progressif (regle de gestion n4, commun aux 6 profils).
 * Niveaux 1-2 automatiques (telephone verifie, profil complete) ;
 * niveaux 3+ sur document, valide par un administrateur.
 */
@Component({
  selector: 'gj-kyc',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Vérification KYC' | t }}</h2>
        <p>{{ 'Renforcez la confiance : plus votre niveau est élevé, plus vous accédez aux missions.' | t }}</p>
      </div>
      <span class="badge badge-info">{{ auth.getKycLevel() | libelle }}</span>
    </div>

    <div class="alerte" *ngIf="requis">
      <gj-icone nom="alert" [taille]="16"></gj-icone>
      {{ 'Cette action demande le niveau' | t }} <strong>{{ requis | libelle }}</strong>.
    </div>

    <section class="carte-section">
      <div class="carte-section__entete">
        <h3><gj-icone nom="shield"></gj-icone>{{ 'Étapes' | t }}</h3>
      </div>
      <ol class="etapes-kyc">
        <li>
          <span class="etapes-kyc__num">1</span>
          <div><strong>{{ 'Niveau 1' | t }}</strong><span>{{ 'Téléphone vérifié par SMS (automatique).' | t }}</span></div>
        </li>
        <li>
          <span class="etapes-kyc__num">2</span>
          <div><strong>{{ 'Niveau 2' | t }}</strong><span>{{ 'Identité déclarée : complétez' | t }} <a [routerLink]="auth.accueil() + '/profil'">{{ 'votre profil' | t }}</a> ({{ 'automatique' | t }}).</span></div>
        </li>
        <li>
          <span class="etapes-kyc__num">3</span>
          <div><strong>{{ 'Niveau 3 et +' | t }}</strong><span>{{ 'Envoyez un document ci-dessous ; un administrateur le valide.' | t }}</span></div>
        </li>
      </ol>
    </section>

    <section class="carte-section">
      <div class="carte-section__entete">
        <h3><gj-icone nom="upload"></gj-icone>{{ 'Soumettre un document' | t }}</h3>
      </div>
      <form class="form-page" [formGroup]="form" (ngSubmit)="soumettre()">
        <div class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Niveau visé' | t }}</label>
            <select formControlName="niveauVise">
              <option value="NIVEAU_3_PIECE_IDENTITE">{{ 'NIVEAU_3_PIECE_IDENTITE' | libelle }} (CNI, passeport)</option>
              <option value="NIVEAU_4_JUSTIFICATIF_DOMICILE">{{ 'NIVEAU_4_JUSTIFICATIF_DOMICILE' | libelle }}</option>
              <option value="NIVEAU_5_DOCUMENTS_PROFESSIONNELS">{{ 'NIVEAU_5_DOCUMENTS_PROFESSIONNELS' | libelle }} (NIF, RCCM, diplôme, agrément)</option>
            </select>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Type de document' | t }}</label>
            <input formControlName="typeDocument" placeholder="CNI, passeport, NIF, RCCM…" />
          </div>
          <div class="champ-groupe champ-large">
            <label>{{ 'Document' | t }} <span class="aide-champ">({{ 'photo ou PDF' | t }})</span></label>
            <input class="champ-fichier" type="file" accept="image/*,application/pdf" (change)="choisir($event)" />
            <span *ngIf="documentUrl" class="badge badge-success preuve__ok"><gj-icone nom="check" [taille]="14"></gj-icone>{{ 'Fichier téléversé' | t }}</span>
          </div>
        </div>
        <div class="actions-droite">
          <button type="submit" [disabled]="form.invalid || !documentUrl || envoi"><gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Soumettre' | t }}</button>
        </div>
      </form>
    </section>

    <div class="carte-section__entete titre-section"><h2>{{ 'Historique' | t }}</h2></div>
    <div class="etat-vide" *ngIf="!soumissions.length"><p>{{ 'Aucun élément' | t }}</p></div>
    <ul class="liste-moderne" *ngIf="soumissions.length">
      <li *ngFor="let s of soumissions">
        <div class="liste-moderne__corps">
          <strong>{{ s.typeDocument }}</strong>
          <span class="aide-champ">{{ s.niveauVise | libelle }}<ng-container *ngIf="s.commentaireValidation"> · {{ s.commentaireValidation }}</ng-container></span>
        </div>
        <span [class]="s.statut | badge">{{ s.statut | libelle }}</span>
      </li>
    </ul>
  `
})
export class KycComponent implements OnInit {
  soumissions: any[] = [];
  documentUrl = '';
  envoi = false;
  requis = '';
  form = this.fb.nonNullable.group({
    niveauVise: ['NIVEAU_3_PIECE_IDENTITE', Validators.required],
    typeDocument: ['', Validators.required]
  });

  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService,
              private fb: FormBuilder, route: ActivatedRoute) {
    this.requis = route.snapshot.queryParamMap.get('requis') ?? '';
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.api.mesSoumissionsKyc().subscribe(res => (this.soumissions = res));
    this.auth.rafraichirCompte().subscribe();
  }

  choisir(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (fichier) {
      this.api.uploader(fichier).subscribe(url => (this.documentUrl = url));
    }
  }

  soumettre(): void {
    const { niveauVise, typeDocument } = this.form.getRawValue();
    this.envoi = true;
    this.api.soumettreKyc(niveauVise, typeDocument, this.documentUrl).subscribe({
      next: () => {
        this.toast.succes('Document envoyé : en attente de validation.');
        this.documentUrl = '';
        this.form.reset({ niveauVise: 'NIVEAU_3_PIECE_IDENTITE', typeDocument: '' });
        this.envoi = false;
        this.charger();
      },
      error: () => (this.envoi = false)
    });
  }
}
