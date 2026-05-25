// Types de base
export type NodeStatus = 'bourgeon' | 'fleur' | 'fruit' | 'feuille';
export type Domain = 'ecologie' | 'social' | 'economie' | 'culture';

// Vote
export interface Vote {
  id: number;
  userId: number;
  score: number; // 1 à 10
  createdAt: string;
}

export interface VoteStats {
  average: number;
  threshold60: number; // score atteint par 60% des votants
  distribution: Record<number, number>; // { 1: 3, 2: 5, ... 10: 12 }
  totalVotes: number;
}

// Argument
export interface Argument {
  id: number;
  content: string;
  type: 'pour' | 'contre';
  votes: Vote[];
  stats: VoteStats;
  createdAt: string;
}

// Amendement
export interface Amendement {
  id: number;
  content: string;
  arguments: Argument[];
  stats: VoteStats;
  createdAt: string;
}

// Nœud principal
export interface Noeud {
  id: number;
  title: string;
  description: string;
  status: NodeStatus;
  domain: Domain;
  brancheId: number;
  arguments: Argument[];
  amendements: Amendement[];
  stats: VoteStats;
  createdAt: string;
  updatedAt: string;
}

// Branche
export interface Branche {
  id: number;
  name: string;
  noeuds: Noeud[];
  userCount: number; // détermine l'épaisseur visuelle
}

// Racine (règle votable)
export interface Racine {
  id: number;
  title: string;
  description: string;
  rule: string;
  stats: VoteStats;
}

// Valeur du tronc
export interface ValeurTronc {
  id: number;
  name: string;
  stats: VoteStats;
}

// Arbre complet
export interface Arbre {
  branches: Branche[];
  racines: Racine[];
  valeurs: ValeurTronc[];
}