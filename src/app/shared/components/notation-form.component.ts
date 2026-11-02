import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

/** Notation multi-criteres (5 criteres ponderes, Architecture V3 section 5.2) apres un chantier. */
@Component({
  selector: 'gj-notation-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="envoyer()" class="form-compact">
      <h4>{{ 'Noter' | t }} {{ nomCible }}</h4>
      <div class="grille-notes">
        <label *ngFor="let c of criteres">
          {{ c.libelle | t }}
          <select [formControlName]="c.cle">
            <option *ngFor="let n of [5, 4, 3, 2, 1]" [ngValue]="n">{{ n }} / 5</option>
          </select>
        </label>
      </div>
      <label>{{ 'Commentaire' | t }}</label>
      <textarea formControlName="commentaire" rows="2"></textarea>
      <button type="submit" class="btn-gold" [disabled]="envoi">{{ 'Envoyer' | t }}</button>
    </form>
  `
})
export class NotationFormComponent {
  @Input({ required: true }) projetId!: string;
  @Input({ required: true }) notePourId!: string;
  @Input() nomCible = '';
  @Output() notee = new EventEmitter<void>();

  envoi = false;
  criteres = [
    { cle: 'qualite', libelle: 'Qualité' },
    { cle: 'delai', libelle: 'Délai' },
    { cle: 'communication', libelle: 'Communication' },
    { cle: 'respectBudget', libelle: 'Respect du budget' },
    { cle: 'proprete', libelle: 'Propreté' }
  ];

  form = this.fb.nonNullable.group({
    qualite: [5, Validators.required],
    delai: [5, Validators.required],
    communication: [5, Validators.required],
    respectBudget: [5, Validators.required],
    proprete: [5, Validators.required],
    commentaire: ['']
  });

  constructor(private fb: FormBuilder, private api: ApiService, private toast: ToastService) {}

  envoyer(): void {
    this.envoi = true;
    this.api.noter({ projetId: this.projetId, notePourId: this.notePourId, ...this.form.getRawValue() }).subscribe({
      next: () => {
        this.toast.succes('Merci pour votre évaluation.');
        this.notee.emit();
      },
      error: () => (this.envoi = false)
    });
  }
}
