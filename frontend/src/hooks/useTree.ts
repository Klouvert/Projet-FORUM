import { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Arbre } from '../types';

export const useTree = () => {
  const [arbre, setArbre] = useState<Arbre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArbre = async () => {
    try {
      setLoading(true);
      const response = await api.get<Arbre>('/tree');
      setArbre(response.data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'arbre');
    } finally {
      setLoading(false);
    }
  };

  const voteNoeud = async (noeudId: number, score: number) => {
    await api.post(`/noeuds/${noeudId}/vote`, { score });
    await fetchArbre();
  };

  const voteArgument = async (argumentId: number, score: number) => {
    await api.post(`/arguments/${argumentId}/vote`, { score });
    await fetchArbre();
  };

  const addArgument = async (noeudId: number, content: string, type: 'pour' | 'contre') => {
    await api.post(`/noeuds/${noeudId}/arguments`, { content, type });
    await fetchArbre();
  };

  const addAmendement = async (noeudId: number, content: string) => {
    await api.post(`/noeuds/${noeudId}/amendements`, { content });
    await fetchArbre();
  };

  useEffect(() => {
    fetchArbre();
  }, []);

  return { arbre, loading, error, voteNoeud, voteArgument, addArgument, addAmendement };
};