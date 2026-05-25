import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import api from '../../api/axios';
import type { Tree, IdeaNode, IdeaDetail } from '../../types';
import { LEVEL_TO_STAGE } from '../../types';
import BourGeonModal from '../modals/BourGeonModal';
import FleurModal from '../modals/FleurModal';
import FruitModal from '../modals/FruitModal';
import FeuilleModal from '../modals/FeuilleModal';
import ErrorBanner from '../ui/ErrorBanner';

interface TreeCanvasProps {
  tree: Tree | null;
  onVoteIdea: (ideaId: string, score: number) => Promise<void>;
  onAddArgument: (ideaId: string, content: string, side: 'pour' | 'contre') => Promise<void>;
  onAddAmendment: (ideaId: string, content: string) => Promise<void>;
  onPromote: (ideaId: string) => Promise<void>;
}

const NODE_COLORS: Record<string, string> = {
  bud: '#9C27B0',
  flower: '#2196F3',
  fruit: '#FFC107',
  leaf: '#4CAF50',
};

const DOMAIN_COLORS: Record<string, string> = {
  ecology: '#4CAF50',
  social: '#e53935',
  economy: '#1565C0',
  culture: '#F9A825',
};

const TreeCanvas = ({ tree, onVoteIdea, onAddArgument, onAddAmendment, onPromote }: TreeCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedDetail, setSelectedDetail] = useState<IdeaDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const openDetail = (idea: IdeaNode) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingDetail(true);
    setDetailError(false);
    setSelectedDetail(null);

    api.get<IdeaDetail>(`/ideas/${idea.id}`, { signal: controller.signal })
      .then(r => setSelectedDetail(r.data))
      .catch(err => {
        if (err.name !== 'CanceledError') setDetailError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false);
      });
  };

  const handlePromote = async (ideaId: string) => {
    await onPromote(ideaId);
    setSelectedDetail(null);
  };

  useEffect(() => {
    if (!tree || !svgRef.current) return;

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

    g.append('rect')
      .attr('x', cx - 20)
      .attr('y', cy - 300)
      .attr('width', 40)
      .attr('height', 300)
      .attr('fill', '#8D6E63')
      .attr('rx', 8);

    const branchCount = tree.branches.length;

    tree.branches.forEach((branch, i) => {
      const angle = ((i / (branchCount - 1 || 1)) * 160 - 80) * (Math.PI / 180);
      const branchLength = 150 + branch.ideaCount * 5;
      const bx = cx + Math.sin(angle) * branchLength;
      const by = cy - 200 - Math.cos(angle) * branchLength * 0.6;
      const strokeWidth = Math.max(3, Math.min(branch.ideaCount / 2, 15));

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
        .text(branch.name);

      const branchIdeas = tree.ideas.filter(idea => idea.branchId === branch.id);

      branchIdeas.forEach((idea: IdeaNode, j: number) => {
        const spread = 40;
        const nx = bx + (j - branchIdeas.length / 2) * spread;
        const ny = by - 30 - j * 20;
        const radius = 8 + idea.voteCount * 0.5;
        const stage = LEVEL_TO_STAGE[idea.level] ?? 'bud';
        const color = DOMAIN_COLORS[idea.domain] ?? NODE_COLORS[stage];

        const nodeG = g.append('g')
          .attr('cursor', 'pointer')
          .on('click', () => openDetail(idea));

        nodeG.append('circle')
          .attr('cx', nx).attr('cy', ny)
          .attr('r', radius)
          .attr('fill', color)
          .attr('opacity', 0.85);

        nodeG.append('title')
          .text(`${idea.title}\nStade: ${stage}\nScore: ${idea.averageScore.toFixed(1)}/10`);
      });
    });

    const rootIdeas = tree.ideas.filter(idea => idea.branchId === null);
    rootIdeas.forEach((idea, j) => {
      const nx = cx + (j - rootIdeas.length / 2) * 50;
      const ny = cy - 320 - j * 20;
      const radius = 8 + idea.voteCount * 0.5;
      const stage = LEVEL_TO_STAGE[idea.level] ?? 'bud';
      const color = DOMAIN_COLORS[idea.domain] ?? NODE_COLORS[stage];

      const nodeG = g.append('g')
        .attr('cursor', 'pointer')
        .on('click', () => openDetail(idea));

      nodeG.append('circle')
        .attr('cx', nx).attr('cy', ny)
        .attr('r', radius)
        .attr('fill', color)
        .attr('opacity', 0.85);

      nodeG.append('title')
        .text(`${idea.title}\nStade: ${stage}\nScore: ${idea.averageScore.toFixed(1)}/10`);
    });

    tree.trunkValues.forEach((value, i) => {
      const vy = cy - 80 - i * 50;
      const vx = cx + (i % 2 === 0 ? -15 : 15);
      const vr = 6 + value.averageScore * 1.5;

      g.append('circle')
        .attr('cx', vx).attr('cy', vy)
        .attr('r', vr)
        .attr('fill', '#8BC34A')
        .attr('opacity', 0.9);

      g.append('text')
        .attr('x', vx + vr + 4).attr('y', vy + 4)
        .attr('fill', '#e0e0e0')
        .attr('font-size', '10px')
        .text(value.name);
    });

  }, [tree]);

  const closeModal = () => setSelectedDetail(null);
  const stage = selectedDetail ? LEVEL_TO_STAGE[selectedDetail.level] : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ background: '#1a1a2e' }}
      />

      {loadingDetail && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 50,
        }}>
          <div style={{
            background: '#16213e',
            border: '1px solid #0f3460',
            borderRadius: '10px',
            padding: '16px 28px',
            color: '#aaa',
            fontSize: '14px',
          }}>
            Chargement...
          </div>
        </div>
      )}

      {detailError && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          width: '320px',
        }}>
          <ErrorBanner
            message="Impossible de charger cette idée. Clique sur un autre nœud pour réessayer."
            onDismiss={() => setDetailError(false)}
          />
        </div>
      )}

      {selectedDetail && stage === 'bud' && (
        <BourGeonModal
          idea={selectedDetail}
          onClose={closeModal}
          onVote={onVoteIdea}
          onAddArgument={onAddArgument}
          onPromote={handlePromote}
        />
      )}
      {selectedDetail && stage === 'flower' && (
        <FleurModal
          idea={selectedDetail}
          onClose={closeModal}
          onVote={onVoteIdea}
          onAddAmendment={onAddAmendment}
          onPromote={handlePromote}
        />
      )}
      {selectedDetail && stage === 'fruit' && (
        <FruitModal
          idea={selectedDetail}
          onClose={closeModal}
          onVote={onVoteIdea}
          onPromote={handlePromote}
        />
      )}
      {selectedDetail && stage === 'leaf' && (
        <FeuilleModal
          idea={selectedDetail}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TreeCanvas;
