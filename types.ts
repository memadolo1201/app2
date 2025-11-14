
import type { Firestore, Auth } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  ref: string;
  nom: string;
  description: string;
  prixAchat: number;
  prixVente: number;
  stock: number;
}

export interface Customer {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
}

export interface DocumentItem {
  id: string;
  ref: string;
  nom: string;
  quantity: number;
  prixVente: number;
}

export interface DocumentData {
  type: 'devis' | 'bon' | 'facture';
  reference: string;
  date: Timestamp;
  customer: Omit<Customer, 'id'>;
  items: DocumentItem[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  status: 'Brouillon' | 'Converti' | 'Payée' | 'Annulée';
  devisRef?: string;
}

export interface Document extends DocumentData {
  id: string;
}


export interface CompanyInfo {
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    legal: string;
    logoUrl: string;
}

export interface Settings {
    companyInfo: CompanyInfo;
    tvaRate: number;
}

export interface FirebaseContextType {
    db: Firestore;
    auth: Auth;
    userId: string | null;
    isAuthReady: boolean;
    appId: string;
}

export type View = 'dashboard' | 'stock' | 'customers' | 'pos' | 'documents' | 'reports' | 'settings';
