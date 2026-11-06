import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit } from '../../shared/models/projet.model';

export type ProduitSaisi = Omit<Produit, 'id' | 'fournisseur'>;

/** Consomme /api/fournisseurs (voir SupplierController backend). */
@Injectable({ providedIn: 'root' })
export class SupplierService {
  private base = `${environment.apiBaseUrl}/fournisseurs`;

  constructor(private http: HttpClient) {}

  listerCatalogue(fournisseurId: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.base}/${fournisseurId}/catalogue`);
  }

  ajouterProduit(produit: ProduitSaisi): Observable<Produit> {
    return this.http.post<Produit>(`${this.base}/catalogue`, produit);
  }

  modifierProduit(produitId: string, produit: ProduitSaisi): Observable<Produit> {
    return this.http.put<Produit>(`${this.base}/catalogue/${produitId}`, produit);
  }

  supprimerProduit(produitId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/catalogue/${produitId}`);
  }
}
