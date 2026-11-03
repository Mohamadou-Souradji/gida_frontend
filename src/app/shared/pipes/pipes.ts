import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { environment } from '../../../environments/environment';
import { nomAffiche, Utilisateur } from '../models/user.model';

/** Traduction francais -> haoussa : {{ 'Enregistrer' | t }}. Impur pour suivre le changement de langue. */
@Pipe({ name: 't', pure: false })
export class TraductionPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(texte: string): string {
    return this.i18n.t(texte);
  }
}

/** Montant en FCFA avec separateurs : 1 500 000 FCFA. */
@Pipe({ name: 'fcfa' })
export class FcfaPipe implements PipeTransform {
  transform(montant: number | null | undefined): string {
    if (montant === null || montant === undefined) {
      return '-';
    }
    return `${Math.round(montant).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
  }
}

/** URL absolue d'un fichier uploade (/files/x.jpg -> http://api/files/x.jpg). */
@Pipe({ name: 'fichier' })
export class FichierPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    if (!url) {
      return '';
    }
    return url.startsWith('http') ? url : environment.fichiersBaseUrl + url;
  }
}

/** Nom affichable d'un utilisateur quel que soit son profil. */
@Pipe({ name: 'nom' })
export class NomPipe implements PipeTransform {
  transform(u: Utilisateur | null | undefined): string {
    return nomAffiche(u);
  }
}

const LIBELLES: Record<string, string> = {
  // Profils
  CLIENT_PARTICULIER: 'Client / Maître d\'ouvrage',
  ARTISAN: 'Artisan',
  ENTREPRISE_BTP: 'Entreprise BTP',
  INGENIEUR_ARCHITECTE: 'Ingénieur / Architecte',
  FOURNISSEUR_MATERIAUX: 'Fournisseur de matériaux',
  ONG_INSTITUTION: 'ONG / Institution',
  // KYC
  NIVEAU_0_NON_VERIFIE: '0 - Non vérifié',
  NIVEAU_1_TELEPHONE_VERIFIE: '1 - Email vérifié',
  NIVEAU_2_IDENTITE_DECLAREE: '2 - Identité déclarée',
  NIVEAU_3_PIECE_IDENTITE: '3 - Pièce d\'identité',
  NIVEAU_4_JUSTIFICATIF_DOMICILE: '4 - Justificatif de domicile',
  NIVEAU_5_DOCUMENTS_PROFESSIONNELS: '5 - Documents professionnels',
  NIVEAU_6_VERIFICATION_TERRAIN: '6 - Vérification terrain',
  EN_ATTENTE: 'En attente',
  APPROUVE: 'Approuvé',
  REJETE: 'Refusé',
  // Escrow
  DRAFT: 'À payer',
  PENDING_PAYMENT: 'Paiement en cours',
  FUNDED: 'Fonds sécurisés',
  PARTIAL_RELEASE: 'Paiement partiel',
  COMPLETED: 'Terminé',
  DISPUTED: 'Litige',
  RESOLVED_CLIENT: 'Litige : client',
  RESOLVED_PROVIDER: 'Litige : prestataire',
  REFUNDED: 'Remboursé',
  // Jalons
  A_FAIRE: 'À faire',
  SOUMIS: 'À valider',
  VALIDE: 'Validé',
  LITIGE: 'Gelé (litige)',
  // AO / candidatures / propositions
  BROUILLON: 'Brouillon',
  PUBLIE: 'Publié',
  EN_DEPOUILLEMENT: 'En dépouillement',
  ATTRIBUE: 'Attribué',
  CLOTURE: 'Clôturé',
  ANNULE: 'Annulé',
  SOUMISE: 'Soumise',
  EN_EVALUATION: 'En évaluation',
  RETENUE: 'Retenue',
  REJETEE: 'Rejetée',
  ENVOYEE: 'Envoyée',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
  // Mobile Money
  AMANA: 'Amana',
  NITA: 'Nita',
  AIRTEL_MONEY: 'Airtel Money',
  ZAMANI_CASH: 'Zamani Cash',
  MOOV_MONEY: 'Moov Money',
  AVAILABLE_NOW: 'Disponible',
  UNAVAILABLE: 'Indisponible',
  // Back-office : etat des projets
  ATTENTE_PAIEMENT: 'Attente de paiement',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  // Back-office : roles de l'equipe
  SUPER_ADMIN: 'Super-admin',
  OPERATEUR_KYC: 'Opérateur KYC',
  GESTIONNAIRE_FINANCES: 'Gestionnaire finances',
  LECTEUR: 'Consultation seule',
  SANS_PROFIL: 'Sans profil',
  STANDARD: 'Standard (2 %)',
  PREMIUM: 'Premium (1,5 %)',
  PRO: 'Pro (1 %)'
};

const CLASSES: Record<string, string> = {
  FUNDED: 'badge-info', PARTIAL_RELEASE: 'badge-info', COMPLETED: 'badge-success', DISPUTED: 'badge-danger',
  RESOLVED_CLIENT: 'badge-gold', RESOLVED_PROVIDER: 'badge-gold', REFUNDED: 'badge-gold', DRAFT: 'badge-warning',
  PENDING_PAYMENT: 'badge-warning', A_FAIRE: '', SOUMIS: 'badge-warning', VALIDE: 'badge-success', REJETE: 'badge-danger',
  LITIGE: 'badge-danger', PUBLIE: 'badge-info', ATTRIBUE: 'badge-success', CLOTURE: '', RETENUE: 'badge-success',
  REJETEE: 'badge-danger', SOUMISE: 'badge-info', EN_EVALUATION: 'badge-warning', ENVOYEE: 'badge-info',
  ACCEPTEE: 'badge-success', REFUSEE: 'badge-danger', APPROUVE: 'badge-success', EN_ATTENTE: 'badge-warning',
  AVAILABLE_NOW: 'badge-success', UNAVAILABLE: '',
  ATTENTE_PAIEMENT: 'badge-warning', EN_COURS: 'badge-info', TERMINE: 'badge-success', BROUILLON: '',
  SUPER_ADMIN: 'badge-gold', OPERATEUR_KYC: 'badge-info', GESTIONNAIRE_FINANCES: 'badge-success', LECTEUR: ''
};

/** Libelle francais d'un code (statut, profil, niveau KYC, operateur), traduit en haoussa si besoin. */
@Pipe({ name: 'libelle', pure: false })
export class LibellePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(code: string | null | undefined): string {
    if (!code) {
      return '-';
    }
    return this.i18n.t(LIBELLES[code] ?? code);
  }
}

/** Classe CSS de badge associee a un statut. */
@Pipe({ name: 'badge' })
export class BadgePipe implements PipeTransform {
  transform(code: string | null | undefined): string {
    return 'badge ' + (CLASSES[code ?? ''] ?? '');
  }
}
