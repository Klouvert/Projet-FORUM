export type NodeStage = 'bud' | 'flower' | 'fruit' | 'leaf';
export type Domain = 'ecology' | 'social' | 'economy' | 'culture';

export const LEVEL_TO_STAGE: Record<number, NodeStage> = {
  0: 'bud',
  1: 'flower',
  2: 'fruit',
  3: 'leaf',
};

export interface Argument {
  id: string;
  content: string;
  side: 'pour' | 'contre';
  averageScore: number;
  voteCount: number;
  createdAt: string;
  authorName: string;
  authorId: string;
}

export interface Amendment {
  id: string;
  title: string;
  content: string;
  isMerged: boolean;
  averageScore: number;
  voteCount: number;
  createdAt: string;
  authorName: string;
  authorId: string;
}

export interface IdeaNode {
  id: string;
  title: string;
  content: string;
  level: number;
  status: string;
  domain: Domain;
  averageScore: number;
  voteCount: number;
  createdAt: string;
  authorName: string;
  branchId: string | null;
}

export interface IdeaDetail extends IdeaNode {
  updatedAt: string;
  authorId: string;
  arguments: Argument[];
  amendments: Amendment[];
}

export interface Branch {
  id: string;
  name: string;
  description: string | null;
  ideaCount: number;
  createdAt: string;
  parentBranchId: string | null;
}

export interface TrunkValue {
  id: string;
  name: string;
  description: string;
  averageScore: number;
  voteCount: number;
}

export interface Tree {
  trunkValues: TrunkValue[];
  branches: Branch[];
  ideas: IdeaNode[];
}