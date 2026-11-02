import { Jalon } from './projet.model';
import { Utilisateur } from './user.model';

/**
 * Machine a etats de l'escrow - voir Cahier des Charges Technique, section 1.3.
 * DRAFT -> PENDING_PAYMENT -> FUNDED -> PARTIAL_RELEASE -> COMPLETED
 *                     (FUNDED/PARTIAL) -> DISPUTED -> RESOLVED_CLIENT / RESOLVED_PROVIDER / REFUNDED
 */
export type EscrowStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'FUNDED'
  | 'PARTIAL_RELEASE'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'RESOLVED_CLIENT'
  | 'RESOLVED_PROVIDER'
  | 'REFUNDED';

export const OPERATEURS_MOBILE_MONEY = ['AMANA', 'NITA', 'AIRTEL_MONEY', 'ZAMANI_CASH', 'MOOV_MONEY'] as const;
export type OperateurMobileMoney = typeof OPERATEURS_MOBILE_MONEY[number];

export interface EscrowMilestone {
  id: string;
  jalon: Jalon;
  montantFcfa: number;
  commissionFcfa?: number;
  montantNetFcfa?: number;
  libere: boolean;
  libereLe?: string;
}

export interface EscrowTransaction {
  id: string;
  montantTotalFcfa: number;
  montantLibereFcfa: number;
  niveauCommission: 'STANDARD' | 'PREMIUM' | 'PRO';
  statut: EscrowStatus;
  operateurMobileMoney?: string;
  motifLitige?: string;
  payeur: Utilisateur;
  beneficiaire: Utilisateur;
  milestones: EscrowMilestone[];
  projet?: { id: string; titre: string };
}

/** Etats ou les fonds sont bloques et les jalons peuvent avancer. */
export const ETATS_FINANCES: EscrowStatus[] = ['FUNDED', 'PARTIAL_RELEASE'];
/** Etats terminaux (notation possible). */
export const ETATS_TERMINES: EscrowStatus[] = ['COMPLETED', 'RESOLVED_CLIENT', 'RESOLVED_PROVIDER', 'REFUNDED'];
