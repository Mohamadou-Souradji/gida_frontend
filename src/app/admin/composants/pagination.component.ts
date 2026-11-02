import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Pagination simple : "21-40 sur 57" + precedent / suivant. */
@Component({
  selector: 'gj-pagination',
  template: `
    <div class="pagination" *ngIf="total > taille">
      <span class="pagination__info">{{ page * taille + 1 }}–{{ fin() }} {{ 'sur' | t }} {{ total }}</span>
      <button type="button" class="bouton-action bouton-action--discret" [disabled]="page === 0" (click)="changer.emit(page - 1)">
        <gj-icone nom="chevron-left" [taille]="15"></gj-icone>{{ 'Précédent' | t }}
      </button>
      <button type="button" class="bouton-action bouton-action--discret" [disabled]="fin() >= total" (click)="changer.emit(page + 1)">
        {{ 'Suivant' | t }}<gj-icone nom="chevron-right" [taille]="15"></gj-icone>
      </button>
    </div>
    <p class="aide" *ngIf="total <= taille && total > 0">{{ total }} {{ 'résultat(s)' | t }}</p>
  `
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() taille = 20;
  @Input() total = 0;
  @Output() changer = new EventEmitter<number>();

  fin(): number {
    return Math.min((this.page + 1) * this.taille, this.total);
  }
}
