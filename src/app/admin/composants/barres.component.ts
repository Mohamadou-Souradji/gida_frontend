import { Component, Input, OnChanges } from '@angular/core';

export interface PointBarre {
  cle: string;
  libelle: string;
  valeur: number;
}

/**
 * Histogramme mono-serie en SVG (aucune dependance) : barres fines a sommet arrondi,
 * grille discrete, valeur au survol et tableau des donnees pour l'accessibilite.
 */
@Component({
  selector: 'gj-barres',
  template: `
    <figure class="graphe">
      <figcaption>
        <strong>{{ titre | t }}</strong>
        <span class="graphe__total">{{ libelleValeur(total()) }}</span>
      </figcaption>
      <svg [attr.viewBox]="'0 0 ' + L + ' ' + H" role="img" [attr.aria-label]="titre" (mouseleave)="survol = -1">
        <g *ngFor="let g of graduations">
          <line [attr.x1]="G" [attr.x2]="L - 8" [attr.y1]="y(g)" [attr.y2]="y(g)" class="graphe__grille" />
          <text [attr.x]="G - 6" [attr.y]="y(g) + 4" text-anchor="end" class="graphe__axe">{{ court(g) }}</text>
        </g>
        <g *ngFor="let p of points; let i = index">
          <rect [attr.x]="G + i * bande" y="0" [attr.width]="bande" [attr.height]="H - B" fill="transparent"
                (mouseenter)="survol = i" (focus)="survol = i" tabindex="0" [attr.aria-label]="p.libelle + ' : ' + p.valeur" />
          <path *ngIf="p.valeur > 0" [attr.d]="barre(i, p.valeur)" class="graphe__barre" [class.survol]="survol === i" />
          <text [attr.x]="G + i * bande + bande / 2" [attr.y]="H - 6" text-anchor="middle" class="graphe__axe">{{ p.libelle }}</text>
        </g>
        <line [attr.x1]="G" [attr.x2]="L - 8" [attr.y1]="H - B" [attr.y2]="H - B" class="graphe__base" />
        <g *ngIf="survol >= 0" class="graphe__bulle">
          <rect [attr.x]="bulleX()" y="2" width="180" height="22" rx="6" />
          <text [attr.x]="bulleX() + 90" y="17" text-anchor="middle">
            {{ points[survol].libelle }} : {{ libelleValeur(points[survol].valeur) }}
          </text>
        </g>
      </svg>
      <details>
        <summary>{{ 'Voir les données' | t }}</summary>
        <div class="tableau-carte"><table class="tableau-moderne">
          <tbody><tr *ngFor="let p of points"><td>{{ p.cle }}</td><td class="nombre">{{ libelleValeur(p.valeur) }}</td></tr></tbody>
        </table></div>
      </details>
    </figure>
  `
})
export class BarresComponent implements OnChanges {
  @Input() titre = '';
  @Input() points: PointBarre[] = [];
  @Input() format: 'fcfa' | 'nombre' = 'nombre';

  readonly L = 460;
  readonly H = 200;
  /** Marge gauche (graduations) et basse (libelles). */
  readonly G = 44;
  readonly B = 24;
  readonly HAUT = 30;
  max = 1;
  graduations: number[] = [];
  survol = -1;

  get bande(): number {
    return (this.L - 8 - this.G) / Math.max(this.points.length, 1);
  }

  ngOnChanges(): void {
    const brut = Math.max(...this.points.map(p => p.valeur), 0);
    this.max = arrondiHaut(brut || 1);
    this.graduations = [0, this.max / 2, this.max];
  }

  total(): number {
    return this.points.reduce((s, p) => s + p.valeur, 0);
  }

  y(v: number): number {
    return this.H - this.B - (v / this.max) * (this.H - this.B - this.HAUT);
  }

  /** Barre a sommet arrondi (4 px), ancree sur la ligne de base. */
  barre(i: number, v: number): string {
    const largeur = Math.min(this.bande * 0.6, 34);
    const x = this.G + i * this.bande + (this.bande - largeur) / 2;
    const base = this.H - this.B;
    const haut = Math.min(this.y(v), base - 2);
    const r = Math.min(4, (base - haut) / 2, largeur / 2);
    return `M${x},${base} V${haut + r} Q${x},${haut} ${x + r},${haut} H${x + largeur - r} `
      + `Q${x + largeur},${haut} ${x + largeur},${haut + r} V${base} Z`;
  }

  bulleX(): number {
    const centre = this.G + this.survol * this.bande + this.bande / 2;
    return Math.max(this.G, Math.min(centre - 90, this.L - 188));
  }

  libelleValeur(v: number): string {
    const s = Math.round(v).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
    return this.format === 'fcfa' ? s + ' FCFA' : s;
  }

  court(v: number): string {
    if (v >= 1_000_000) {
      return (Math.round(v / 100_000) / 10).toString().replace('.', ',') + ' M';
    }
    if (v >= 1_000) {
      return Math.round(v / 1_000) + ' k';
    }
    return String(Math.round(v));
  }
}

/** Arrondit au-dessus a 1, 2 ou 5 x 10^n (graduations lisibles). */
function arrondiHaut(v: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 5, 10]) {
    if (v <= m * p) {
      return m * p;
    }
  }
  return 10 * p;
}
