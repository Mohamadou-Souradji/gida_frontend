import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  texte: string;
  type: 'succes' | 'erreur' | 'info';
}

/** Messages flash affiches dans la coquille de l'application (succes, erreurs API...). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private compteur = 0;

  succes(texte: string): void {
    this.ajouter(texte, 'succes');
  }

  erreur(texte: string): void {
    this.ajouter(texte, 'erreur', 7000);
  }

  info(texte: string): void {
    this.ajouter(texte, 'info');
  }

  fermer(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  private ajouter(texte: string, type: Toast['type'], duree = 4000): void {
    const id = ++this.compteur;
    this.toasts = [...this.toasts, { id, texte, type }];
    setTimeout(() => this.fermer(id), duree);
  }
}
