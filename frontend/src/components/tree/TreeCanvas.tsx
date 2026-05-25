import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Arbre, Noeud } from '../../types';
import BourGeonModal from '../modals/BourGeonModal';
import FleurModal from '../modals/FleurModal';
import FruitModal from '../modals/FruitModal';
import FeuilleModal from '../modals/FeuilleModal';

interface TreeCanvasProps {
  arbre: Arbre | null;
  onVoteNoeud: (noeudId: number, score: number) => void;
  onVoteArgument: (argumentId: number, score: number) => void;
  onAddArgument: (noeudId: number, content: string, type: 'pour' | 'contre') => void;
  onAddAmendement: (noeudId: number, content: string) => void;
}

const NODE_COLORS: Record<string, string> = {
  bourgeon: '#9C27B0',
  fleur: '#2196F3',
  fruit: '#FFC107',
  feuille: '#4CAF50',
};

const DOMAIN_COLORS: Record<string, string> = {
  ecologie: '#4CAF50',
  social: '#e53935',
  economie: '#1565C0',
  culture: '#F9A825',
};

const TreeCanvas = ({ arbre, onVoteNoeud, onVoteArgument, onAddArgument, onAddAmendement }: TreeCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNoeud, setSelectedNoeud] = useState<Noeud | null>(null);

  useEffect(() => {
    if (!arbre || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const cx = width / 2;
    const cy = height;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => g.attr('transform', event.transform))
    );

    // Tronc
    g.append('rect')
      .attr('x', cx - 20)
      .attr('y', cy - 300)
      .attr('width', 40)
      .attr('height', 300)
      .attr('fill', '#8D6E63')
      .attr('rx', 8);

    // Branches et nœuds
    const branchCount = arbre.branches.length;

    arbre.branches.forEach((branche, i) => {
      const angle = ((i / (branchCount - 1 || 1)) * 160 - 80) * (Math.PI / 180);
      const branchLength = 150 + branche.userCount * 2;
      const bx = cx + Math.sin(angle) * branchLength;
      const by = cy - 200 - Math.cos(angle) * branchLength * 0.6;
      const strokeWidth = Math.max(3, Math.min(branche.userCount / 10, 15));

      g.append('line')
        .attr('x1', cx).attr('y1', cy - 200)
        .attr('x2', bx).attr('y2', by)
        .attr('stroke', '#5D4037')
        .attr('stroke-width', strokeWidth)
        .attr('stroke-linecap', 'round');

      g.append('text')
        .attr('x', bx).attr('y', by - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e0e0e0')
        .attr('font-size', '12px')
        .text(branche.name);

      branche.noeuds.forEach((noeud: Noeud, j: number) => {
        const spread = 40;
        const nx = bx + (j - branche.noeuds.length / 2) * spread;
        const ny = by - 30 - j * 20;
        const radius = 8 + noeud.stats.totalVotes * 0.5;
        const color = DOMAIN_COLORS[noeud.domain] || NODE_COLORS[noeud.status];

        const nodeG = g.append('g')
          .attr('cursor', 'pointer')
          .on('click', () => setSelectedNoeud(noeud));

        nodeG.append('circle')
          .attr('cx', nx).attr('cy', ny)
          .attr('r', radius)
          .attr('fill', color)
          .attr('opacity', 0.85);

        nodeG.append('title')
          .text(`${noeud.title}\nStatut: ${noeud.status}\nScore: ${noeud.stats.average}/10`);
      });
    });

    // Valeurs du tronc
    arbre.valeurs.forEach((valeur, i) => {
      const vy = cy - 80 - i * 50;
      const vx = cx + (i % 2 === 0 ? -15 : 15);
      const vr = 6 + valeur.stats.average * 1.5;

      g.append('circle')
        .attr('cx', vx).attr('cy', vy)
        .attr('r', vr)
        .attr('fill', '#8BC34A')
        .attr('opacity', 0.9);

      g.append('text')
        .attr('x', vx + vr + 4).attr('y', vy + 4)
        .attr('fill', '#e0e0e0')
        .attr('font-size', '10px')
        .text(valeur.name);
    });

  }, [arbre]);

  const closeModal = () => setSelectedNoeud(null);

  return (
    <>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ background: '#1a1a2e' }}
      />

      {selectedNoeud?.status === 'bourgeon' && (
        <BourGeonModal
          noeud={selectedNoeud}
          onClose={closeModal}
          onVote={onVoteNoeud}
          onAddArgument={onAddArgument}
        />
      )}
      {selectedNoeud?.status === 'fleur' && (
        <FleurModal
          noeud={selectedNoeud}
          onClose={closeModal}
          onVote={onVoteNoeud}
          onAddAmendement={onAddAmendement}
        />
      )}
      {selectedNoeud?.status === 'fruit' && (
        <FruitModal
          noeud={selectedNoeud}
          onClose={closeModal}
          onVote={onVoteNoeud}
        />
      )}
      {selectedNoeud?.status === 'feuille' && (
        <FeuilleModal
          noeud={selectedNoeud}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default TreeCanvas;