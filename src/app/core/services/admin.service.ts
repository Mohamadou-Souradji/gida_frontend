import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EscrowTransaction } from '../../shared/models/escrow.model';
import {
  MembreEquipe, MoiAdmin, PageAdmin, PermissionAdmin, ProjetDetail, ProjetLigne, RetraitLigne,
  RoleAdmin, TableauDeBord, TransactionDetail, TransactionLigne
} from '../../shared/models/admin.model';

/**
 * Back-office (role ADMIN) : tableau de bord, projets, transactions, KYC, litiges,
 * equipe et journal. Les permissions de la session (/admin/moi) pilotent les menus ;
 * le serveur reste seul juge (403 sinon).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiBaseUrl}/admin`;

  /** Session admin courante, chargee par le shell du back-office. */
  moi: MoiAdmin | null = null;

  constructor(private http: HttpClient) {}

  chargerMoi(): Observable<MoiAdmin> {
    return this.http.get<MoiAdmin>(`${this.base}/moi`).pipe(tap(m => (this.moi = m)));
  }

  peut(permission: PermissionAdmin): boolean {
    return !!this.moi?.permissions.includes(permission);
  }

  // ---- pilotage
  tableauDeBord(): Observable<TableauDeBord> {
    return this.http.get<TableauDeBord>(`${this.base}/tableau-de-bord`);
  }

  projets(filtres: { q?: string; etat?: string; page?: number; taille?: number }): Observable<PageAdmin<ProjetLigne>> {
    return this.http.get<PageAdmin<ProjetLigne>>(`${this.base}/projets`, { params: params(filtres) });
  }

  projet(id: string): Observable<ProjetDetail> {
    return this.http.get<ProjetDetail>(`${this.base}/projets/${id}`);
  }

  transactions(filtres: { q?: string; statut?: string; page?: number; taille?: number }): Observable<PageAdmin<TransactionLigne>> {
    return this.http.get<PageAdmin<TransactionLigne>>(`${this.base}/transactions`, { params: params(filtres) });
  }

  transaction(id: string): Observable<TransactionDetail> {
    return this.http.get<TransactionDetail>(`${this.base}/transactions/${id}`);
  }

  exporterTransactions(filtres: { q?: string; statut?: string }): Observable<Blob> {
    return this.http.get(`${this.base}/transactions/export`, { params: params(filtres), responseType: 'blob' });
  }

  retraits(filtres: { q?: string; page?: number; taille?: number }): Observable<PageAdmin<RetraitLigne>> {
    return this.http.get<PageAdmin<RetraitLigne>>(`${this.base}/retraits`, { params: params(filtres) });
  }

  // ---- KYC
  kycEnAttente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/kyc/en-attente`);
  }

  approuverKyc(id: string): Observable<unknown> {
    return this.http.patch(`${this.base}/kyc/${id}/approuver`, {});
  }

  rejeterKyc(id: string, commentaire: string): Observable<unknown> {
    return this.http.patch(`${this.base}/kyc/${id}/rejeter`, { commentaire });
  }

  // ---- litiges
  litiges(): Observable<EscrowTransaction[]> {
    return this.http.get<EscrowTransaction[]>(`${this.base}/litiges`);
  }

  resoudre(id: string, resolution: string, commentaire: string): Observable<unknown> {
    return this.http.patch(`${this.base}/litiges/${id}/resoudre`, { resolution, commentaire });
  }

  // ---- equipe
  equipe(): Observable<MembreEquipe[]> {
    return this.http.get<MembreEquipe[]>(`${this.base}/equipe`);
  }

  ajouterMembre(phone: string, nom: string, role: RoleAdmin): Observable<MembreEquipe[]> {
    return this.http.post<MembreEquipe[]>(`${this.base}/equipe`, { phone, nom, role });
  }

  modifierMembre(id: string, changement: { role?: RoleAdmin; actif?: boolean; nom?: string }): Observable<MembreEquipe[]> {
    return this.http.patch<MembreEquipe[]>(`${this.base}/equipe/${id}`, changement);
  }

  retirerMembre(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/equipe/${id}`);
  }

  // ---- journal
  journal(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/journal`);
  }
}

/** Parametres de requete sans les valeurs vides. */
function params(filtres: Record<string, string | number | undefined | null>): HttpParams {
  let p = new HttpParams();
  Object.entries(filtres).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      p = p.set(k, String(v));
    }
  });
  return p;
}
