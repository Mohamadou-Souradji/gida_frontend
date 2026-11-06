import { Injectable } from '@angular/core';
import { HAOUSSA } from './i18n.haoussa';

export type Langue = 'fr' | 'ha';
const CLE_LANGUE = 'gj_langue';

/**
 * Interface bilingue francais / haoussa (exigence du Document de Reference,
 * section 9, et Architecture Globale V3, section 6.3).
 *
 * Les textes de l'interface sont ecrits en francais dans les templates et
 * passes dans le pipe "t" : en haoussa, le pipe renvoie la traduction du
 * dictionnaire HAOUSSA, ou le francais si la cle n'est pas encore traduite.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  langue: Langue = (localStorage.getItem(CLE_LANGUE) as Langue) || 'fr';

  changer(langue: Langue): void {
    this.langue = langue;
    localStorage.setItem(CLE_LANGUE, langue);
    document.documentElement.lang = langue;
  }

  t(texte: string): string {
    if (this.langue === 'ha') {
      return HAOUSSA[texte] ?? texte;
    }
    return texte;
  }
}
