export type ProfileType =
  | 'CLIENT_PARTICULIER'
  | 'ARTISAN'
  | 'ENTREPRISE_BTP'
  | 'INGENIEUR_ARCHITECTE'
  | 'FOURNISSEUR_MATERIAUX'
  | 'ONG_INSTITUTION';

/** 7 niveaux de verification KYC - voir Architecture Globale V3, section 5.1. */
export type KycLevel =
  | 'NIVEAU_0_NON_VERIFIE'
  | 'NIVEAU_1_TELEPHONE_VERIFIE'
  | 'NIVEAU_2_IDENTITE_DECLAREE'
  | 'NIVEAU_3_PIECE_IDENTITE'
  | 'NIVEAU_4_JUSTIFICATIF_DOMICILE'
  | 'NIVEAU_5_DOCUMENTS_PROFESSIONNELS'
  | 'NIVEAU_6_VERIFICATION_TERRAIN';

export const ORDRE_KYC: KycLevel[] = [
  'NIVEAU_0_NON_VERIFIE',
  'NIVEAU_1_TELEPHONE_VERIFIE',
  'NIVEAU_2_IDENTITE_DECLAREE',
  'NIVEAU_3_PIECE_IDENTITE',
  'NIVEAU_4_JUSTIFICATIF_DOMICILE',
  'NIVEAU_5_DOCUMENTS_PROFESSIONNELS',
  'NIVEAU_6_VERIFICATION_TERRAIN'
];

export interface AuthResponse {
  token: string;
  userId: string;
  profileType: ProfileType;
  kycLevel: KycLevel;
  admin: boolean;
  /** SUPER_ADMIN, OPERATEUR_KYC, GESTIONNAIRE_FINANCES, LECTEUR (null si non admin). */
  adminRole?: string | null;
}

export interface Compte {
  id: string;
  phone: string;
  profileType: ProfileType;
  kycLevel: KycLevel;
  walletBalance: number;
  profileScore: number;
  languePreferee: 'fr' | 'ha';
  admin: boolean;
  adminRole?: string | null;
  notificationsNonLues: number;
}

/** Utilisateur tel que renvoye par l'API (champs communs + champs du profil). */
export interface Utilisateur {
  id: string;
  profileType?: ProfileType;
  kycLevel?: KycLevel;
  profileScore?: number;
  nom?: string;
  prenom?: string;
  nomCommercial?: string;
  raisonSociale?: string;
  nomBoutique?: string;
  corpsDeMetier?: string;
  zoneIntervention?: string;
  disponibilite?: 'AVAILABLE_NOW' | 'UNAVAILABLE';
  tarifJournalierFcfa?: number;
  [cle: string]: unknown;
}

/** Nom affichable quel que soit le profil. */
export function nomAffiche(u?: Utilisateur | null): string {
  if (!u) {
    return '-';
  }
  return (u.nomCommercial || u.raisonSociale || u.nomBoutique
    || [u.prenom, u.nom].filter(Boolean).join(' ') || 'Utilisateur') as string;
}

export interface NotificationGj {
  id: string;
  titre: string;
  contenu: string;
  lu: boolean;
  createdAt: string;
}
