import { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Tree } from '../types';

export const useTree = () => {
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await api.get<Tree>('/tree');
        setTree(r.data);
      } catch {
        setError("Erreur lors du chargement de l'arbre");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refresh]);

  const refreshTree = () => setRefresh(n => n + 1);

  const voteIdea = async (ideaId: string, score: number) => {
    await api.put(`/ideas/${ideaId}/vote`, { score });
    refreshTree();
  };

  const voteArgument = async (argumentId: string, score: number) => {
    await api.put(`/arguments/${argumentId}/vote`, { score });
    refreshTree();
  };

  const addArgument = async (ideaId: string, content: string, side: 'pour' | 'contre') => {
    await api.post(`/ideas/${ideaId}/arguments`, { content, side });
    refreshTree();
  };

  const addAmendment = async (ideaId: string, content: string) => {
    await api.post(`/ideas/${ideaId}/amendments`, { content });
    refreshTree();
  };

  const createIdea = async (title: string, content: string, domain: string, branchId?: string) => {
    await api.post('/ideas', { title, content, domain, branchId: branchId ?? null });
    refreshTree();
  };

  const promoteIdea = async (ideaId: string) => {
    await api.put(`/ideas/${ideaId}/promote`);
    refreshTree();
  };

  const createBranch = async (name: string, description?: string, parentBranchId?: string) => {
    await api.post('/branches', { name, description: description ?? null, parentBranchId: parentBranchId ?? null });
    refreshTree();
  };

  const createTrunkValue = async (name: string, description: string) => {
    await api.post('/trunk-values', { name, description });
    refreshTree();
  };

  const updateTrunkValue = async (id: string, name: string, description: string) => {
    await api.put(`/trunk-values/${id}`, { name, description });
    refreshTree();
  };

  const deleteTrunkValue = async (id: string) => {
    await api.delete(`/trunk-values/${id}`);
    refreshTree();
  };

  const updateBranch = async (id: string, name: string, description?: string) => {
    await api.put(`/branches/${id}`, { name, description: description ?? null });
    refreshTree();
  };

  const deleteBranch = async (id: string) => {
    await api.delete(`/branches/${id}`);
    refreshTree();
  };

  const updateIdea = async (id: string, title: string, content: string) => {
    await api.put(`/ideas/${id}`, { title, content });
    refreshTree();
  };

  const deleteIdea = async (id: string) => {
    await api.delete(`/ideas/${id}`);
    refreshTree();
  };

  const updateArgument = async (id: string, content: string) => {
    await api.put(`/arguments/${id}`, { content });
    refreshTree();
  };

  const deleteArgument = async (id: string) => {
    await api.delete(`/arguments/${id}`);
    refreshTree();
  };

  const updateAmendment = async (id: string, content: string) => {
    await api.put(`/amendments/${id}`, { content });
    refreshTree();
  };

  const deleteAmendment = async (id: string) => {
    await api.delete(`/amendments/${id}`);
    refreshTree();
  };

  return {
    tree, loading, error,
    voteIdea, voteArgument, addArgument, addAmendment,
    createIdea, promoteIdea, updateIdea, deleteIdea,
    createBranch, updateBranch, deleteBranch,
    createTrunkValue, updateTrunkValue, deleteTrunkValue,
    updateArgument, deleteArgument,
    updateAmendment, deleteAmendment,
  };
};