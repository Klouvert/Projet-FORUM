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
import TreeLegend from './TreeLegend';

interface TreeCanvasProps {
  tree: Tree | null;
  onVoteIdea: (ideaId: string, score: number) => Promise<void>;
  onAddArgument: (ideaId: string, content: string, side: 'pour' | 'contre') => Promise<void>;
  onAddAmendment: (ideaId: string, content: string) => Promise<void>;
  onPromote: (ideaId: string) => Promise<void>;
  onRequestCreate: (branchId?: string) => void;
  onDeleteIdea: (ideaId: string) => Promise<void>;
}

/* ── Palette ───────────────────────────────────────────────── */
const STAGE_COLORS: Record<string, string> = {
  bud:    '#b39ddb',
  flower: '#f48fb1',
  fruit:  '#ffcc80',
  leaf:   '#a5d6a7',
};
const STAGE_LABELS: Record<string, string> = {
  bud: 'Bourgeon', flower: 'Fleur', fruit: 'Fruit', leaf: 'Feuille',
};
const DOMAIN_COLORS: Record<string, string> = {
  ecology: '#66bb6a', social: '#ef5350', economy: '#42a5f5', culture: '#ffa726',
};

type NodeStage = 'bud' | 'flower' | 'fruit' | 'leaf';

const NODE_SPACING    = 52;
const FIRST_NODE_DIST = 50; /* assez loin du tronc pour éviter le chevauchement */
const TIP_EXTRA       = 38;
const TRUNK_H         = 260;

/* Ordre d'avancement : Feuille (plus mature) → Bourgeon (moins mature) */
const STAGE_ORDER: Record<string, number> = { leaf: 0, fruit: 1, flower: 2, bud: 3 };

function wrapTitle(title: string, maxChars = 14): [string, string] {
  if (title.length <= maxChars) return [title, ''];
  const cut = title.lastIndexOf(' ', maxChars);
  const pos = cut > 2 ? cut : maxChars;
  const rest = title.slice(pos).trimStart();
  const line2 = rest.length > maxChars ? rest.slice(0, maxChars - 1) + '…' : rest;
  return [title.slice(0, pos), line2];
}

/* ── Shapes ────────────────────────────────────────────────── */
function budPath(r: number) {
  const tip = r * 0.9;
  return `M 0 ${-r - tip} Q ${r} ${-r * 0.3}, 0 ${r} Q ${-r} ${-r * 0.3}, 0 ${-r - tip} Z`;
}
function leafPath(r: number) {
  return `M 0 ${-r} Q ${r * 1.1} ${-r * 0.1}, 0 ${r} Q ${-r * 1.1} ${-r * 0.1}, 0 ${-r} Z`;
}

function appendNodeShape(
  group: d3.Selection<SVGGElement, unknown, SVGGElement, unknown>,
  stage: NodeStage, r: number, color: string, selected: boolean,
) {
  const stroke = selected ? '#ffffff' : 'none';
  const sw = selected ? 2 : 0;
  switch (stage) {
    case 'bud':
      group.append('path').attr('d', budPath(r))
        .attr('fill', color).attr('opacity', 0.85)
        .attr('stroke', stroke).attr('stroke-width', sw);
      break;
    case 'flower': {
      const pr = r * 0.55, pr2 = r * 0.95;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const fx = Math.cos(a) * pr2, fy = Math.sin(a) * pr2;
        group.append('ellipse').attr('cx', fx).attr('cy', fy)
          .attr('rx', pr).attr('ry', pr * 0.6)
          .attr('transform', `rotate(${(a * 180) / Math.PI + 90},${fx},${fy})`)
          .attr('fill', color).attr('opacity', 0.82);
      }
      group.append('circle').attr('r', r * 0.35).attr('fill', '#fff9c4').attr('opacity', 0.9);
      if (selected) group.append('circle').attr('r', r * 1.1)
        .attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2);
      break;
    }
    case 'fruit':
      group.append('circle').attr('r', r).attr('fill', color).attr('opacity', 0.92)
        .attr('stroke', stroke).attr('stroke-width', sw);
      group.append('circle').attr('r', r * 0.4)
        .attr('cx', -r * 0.25).attr('cy', -r * 0.25)
        .attr('fill', '#fff').attr('opacity', 0.2);
      break;
    case 'leaf':
      group.append('path').attr('d', leafPath(r)).attr('fill', color).attr('opacity', 0.88)
        .attr('transform', 'rotate(35)').attr('stroke', stroke).attr('stroke-width', sw);
      group.append('line')
        .attr('x1', 0).attr('y1', -r * 0.85).attr('x2', 0).attr('y2', r * 0.85)
        .attr('stroke', 'rgba(0,0,0,0.25)').attr('stroke-width', 0.8).attr('transform', 'rotate(35)');
      break;
  }
}

function trunkPath(cx: number, cy: number) {
  const bw = 28, tw = 10, h = TRUNK_H;
  return [
    `M ${cx - bw} ${cy}`,
    `C ${cx - bw} ${cy - h * 0.3}, ${cx - tw} ${cy - h * 0.5}, ${cx - tw} ${cy - h}`,
    `L ${cx + tw} ${cy - h}`,
    `C ${cx + tw} ${cy - h * 0.5}, ${cx + bw} ${cy - h * 0.3}, ${cx + bw} ${cy}`,
    'Z',
  ].join(' ');
}

function bezierBranch(x1: number, y1: number, x2: number, y2: number) {
  const dy = (y2 - y1) * 0.45;
  return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy * 0.5}, ${x2} ${y2}`;
}

function appendAddButton(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number, y: number, onClick: () => void,
) {
  const btn = g.append('g')
    .attr('transform', `translate(${x},${y})`)
    .attr('cursor', 'pointer')
    .on('click', (e) => { e.stopPropagation(); onClick(); });
  btn.append('circle').attr('r', 9).attr('fill', '#7e57c2').attr('opacity', 0.85);
  btn.append('text').attr('text-anchor', 'middle').attr('dy', '0.38em')
    .attr('fill', '#fff').attr('font-size', '15px').attr('font-weight', 'bold').text('+');
  btn.on('mouseenter', function () {
    d3.select(this).select('circle').attr('opacity', 1).attr('r', 11);
  }).on('mouseleave', function () {
    d3.select(this).select('circle').attr('opacity', 0.85).attr('r', 9);
  });
}

/* ── Composant ─────────────────────────────────────────────── */
const TreeCanvas = ({
  tree, onVoteIdea, onAddArgument, onAddAmendment, onPromote, onRequestCreate, onDeleteIdea,
}: TreeCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedDetail, setSelectedDetail] = useState<IdeaDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const openDetail = (idea: IdeaNode) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSelectedId(idea.id);
    setLoadingDetail(true);
    setDetailError(false);
    setSelectedDetail(null);
    api.get<IdeaDetail>(`/ideas/${idea.id}`, { signal: ctrl.signal })
      .then(r => setSelectedDetail(r.data))
      .catch(err => { if (err.name !== 'CanceledError') setDetailError(true); })
      .finally(() => { if (!ctrl.signal.aborted) setLoadingDetail(false); });
  };

  const handlePromote = async (ideaId: string) => {
    await onPromote(ideaId);
    setSelectedDetail(null);
    setSelectedId(null);
  };

  const handleDelete = async (ideaId: string) => {
    await onDeleteIdea(ideaId);
    setSelectedDetail(null);
    setSelectedId(null);
  };

  useEffect(() => {
    if (!tree || !svgRef.current) return;

    const width  = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const cx = width / 2;
    const cy = Math.round(height * 0.76);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    const trunkGrad = defs.append('linearGradient').attr('id', 'trunk-grad')
      .attr('x1', '0%').attr('y1', '100%').attr('x2', '0%').attr('y2', '0%');
    trunkGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3b2510');
    trunkGrad.append('stop').attr('offset', '100%').attr('stop-color', '#7a5c38');

    const g = svg.append('g');
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.25, 3])
        .on('zoom', (e) => g.attr('transform', e.transform))
    );

    /* ── Socle ───────────────────────────────────────────────── */
    g.append('ellipse').attr('cx', cx).attr('cy', cy + 16)
      .attr('rx', 120).attr('ry', 20)
      .attr('fill', '#1e0f04').attr('opacity', 0.9);

    /* graines dans le socle */
    const seeds = tree.trunkValues;
    seeds.forEach((value, i) => {
      const spacing = Math.min(seeds.length * 32, 180) / Math.max(seeds.length - 1, 1);
      const sx = cx + (i - (seeds.length - 1) / 2) * spacing;
      const sy = cy + 16;
      const sr = 5;
      g.append('circle').attr('cx', sx).attr('cy', sy).attr('r', sr)
        .attr('fill', '#a5d6a7').attr('opacity', 0.9);
      g.append('text').attr('x', sx).attr('y', sy + sr + 12)
        .attr('text-anchor', 'middle').attr('fill', '#6a8a6a')
        .attr('font-size', '9px').text(value.name);
    });

    /* bouton + graine */
    appendAddButton(g, cx + 100, cy + 16, () => onRequestCreate(undefined));

    /* ── Tronc ───────────────────────────────────────────────── */
    g.append('path').attr('d', trunkPath(cx, cy))
      .attr('fill', 'url(#trunk-grad)')
      .attr('filter', 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))');

    /* ── Branches alternées ──────────────────────────────────── */
    const branchCount = tree.branches.length;
    const totalLevels = Math.ceil(branchCount / 2);

    tree.branches.forEach((branch, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const levelIndex = Math.floor(i / 2);
      const levelFrac  = totalLevels > 1 ? levelIndex / (totalLevels - 1) : 0.5;

      /* point d'attache sur le tronc */
      const attachY = cy - TRUNK_H * (0.20 + levelFrac * 0.70);
      const attachX = cx + side * 10;

      /* angle : bas = 58°, haut = 26° */
      const angleDeg   = 58 - levelFrac * 32;
      const angle      = side * angleDeg * (Math.PI / 180);
      const unitX      = Math.sin(angle);
      const unitY      = -Math.cos(angle);

      /* longueur = espace nécessaire pour tous les nœuds */
      const ideaCount    = tree.ideas.filter(id => id.branchId === branch.id).length;
      const branchLength = Math.max(110, FIRST_NODE_DIST + ideaCount * NODE_SPACING + TIP_EXTRA);

      const bx = attachX + unitX * branchLength;
      const by = attachY + unitY * branchLength;

      const sw = Math.max(2.5, Math.min(ideaCount * 1.2 + 3, 14));
      const branchColor = d3.interpolateRgb('#8b6340', '#7aaa50')(levelFrac);

      /* branche bézier */
      const pathEl = g.append('path')
        .attr('d', bezierBranch(attachX, attachY, bx, by))
        .attr('stroke', branchColor).attr('stroke-width', sw)
        .attr('stroke-linecap', 'round').attr('fill', 'none');
      const totalLen = (pathEl.node() as SVGPathElement).getTotalLength();
      pathEl.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
        .transition().duration(600).delay(i * 80).ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      /* nom de branche : au plus proche du tronc */
      const labelAnchor = side > 0 ? 'start' : 'end';
      const labelX = cx + side * 42;
      const labelY = attachY - 5;
      g.append('text').attr('x', labelX).attr('y', labelY)
        .attr('text-anchor', labelAnchor)
        .attr('fill', '#9aabb8').attr('font-size', '11px').attr('font-weight', '500')
        .attr('letter-spacing', '0.3px').text(branch.name);

      /* bouton + à l'extrémité */
      appendAddButton(g, bx + unitX * 18, by + unitY * 18, () => onRequestCreate(branch.id));

      /* ── Nœuds : triés par avancement (Feuille→Bourgeon), collés sur la branche ── */
      const branchIdeas = tree.ideas
        .filter(idea => idea.branchId === branch.id)
        .sort((a, b) => {
          const sa = LEVEL_TO_STAGE[a.level] ?? 'bud';
          const sb = LEVEL_TO_STAGE[b.level] ?? 'bud';
          return STAGE_ORDER[sa] - STAGE_ORDER[sb];
        });

      /* Perpendiculaire CCW : labels alternent au-dessus / en-dessous de la branche */
      const perpX = -unitY;
      const perpY =  unitX;

      branchIdeas.forEach((idea: IdeaNode, j: number) => {
        const dist = FIRST_NODE_DIST + j * NODE_SPACING;
        const alt  = j % 2 === 0 ? -1 : 1;

        /* nœud collé sur la branche */
        const nx = attachX + unitX * dist;
        const ny = attachY + unitY * dist;

        const stage      = (LEVEL_TO_STAGE[idea.level] ?? 'bud') as NodeStage;
        const baseColor  = DOMAIN_COLORS[idea.domain] ?? STAGE_COLORS[stage];
        const radius     = 7 + idea.voteCount * 0.5;
        const isSelected = selectedId === idea.id;

        const nodeG = g.append('g')
          .attr('transform', `translate(${nx},${ny})`)
          .attr('cursor', 'pointer').attr('tabindex', '0')
          .on('click', () => openDetail(idea))
          .on('keydown', (e) => { if (e.key === 'Enter') openDetail(idea); });

        appendNodeShape(nodeG as never, stage, radius, baseColor, isSelected);

        /* label perpendiculaire à la branche, alternance haut/bas */
        const labelGap  = radius + 6;
        const lx        = alt * perpX * labelGap;
        const ly        = alt * perpY * labelGap;
        const textAnchor = lx > 0.5 ? 'start' : lx < -0.5 ? 'end' : 'middle';
        const [line1, line2] = wrapTitle(idea.title);
        const lineH = 9;
        const yBase = ly + (alt < 0 ? -(line2 ? lineH : 2) : 2);

        nodeG.append('text')
          .attr('x', lx).attr('y', yBase)
          .attr('text-anchor', textAnchor)
          .attr('fill', '#8a9ab0').attr('font-size', '8px')
          .text(line1);
        if (line2) {
          nodeG.append('text')
            .attr('x', lx).attr('y', yBase + lineH)
            .attr('text-anchor', textAnchor)
            .attr('fill', '#8a9ab0').attr('font-size', '8px')
            .text(line2);
        }

        nodeG.append('title')
          .text(`${idea.title}\nÉtape: ${STAGE_LABELS[stage]}\nScore: ${idea.averageScore.toFixed(1)}/10`);

        nodeG
          .on('mouseenter', function () {
            d3.select(this).transition().duration(150)
              .attr('transform', `translate(${nx},${ny}) scale(1.5)`);
          })
          .on('mouseleave', function () {
            d3.select(this).transition().duration(150)
              .attr('transform', `translate(${nx},${ny}) scale(1)`);
          });
      });
    });

    /* ── Idées sans branche (au-dessus du tronc) ─────────────── */
    const rootIdeas = tree.ideas.filter(idea => idea.branchId === null);
    const trunkTopY = cy - TRUNK_H;
    rootIdeas.forEach((idea, j) => {
      const nx = cx + (j - (rootIdeas.length - 1) / 2) * 52;
      const ny = trunkTopY - 26 - j * 28;
      const stage     = (LEVEL_TO_STAGE[idea.level] ?? 'bud') as NodeStage;
      const baseColor = DOMAIN_COLORS[idea.domain] ?? STAGE_COLORS[stage];
      const radius    = 7 + idea.voteCount * 0.5;
      const isSelected = selectedId === idea.id;

      g.append('line')
        .attr('x1', cx).attr('y1', trunkTopY)
        .attr('x2', nx).attr('y2', ny + radius)
        .attr('stroke', '#5c4030').attr('stroke-width', 1.5).attr('opacity', 0.4);

      const nodeG = g.append('g')
        .attr('transform', `translate(${nx},${ny})`)
        .attr('cursor', 'pointer').attr('tabindex', '0')
        .on('click', () => openDetail(idea))
        .on('keydown', (e) => { if (e.key === 'Enter') openDetail(idea); });

      appendNodeShape(nodeG as never, stage, radius, baseColor, isSelected);

      const labelX = nx < cx ? -(radius + 10) : (radius + 10);
      const textAnchor = nx < cx ? 'end' : 'start';
      const [rl1, rl2] = wrapTitle(idea.title);
      nodeG.append('text').attr('x', labelX).attr('y', rl2 ? -4 : 3)
        .attr('text-anchor', textAnchor).attr('fill', '#8a9ab0').attr('font-size', '8px')
        .text(rl1);
      if (rl2) {
        nodeG.append('text').attr('x', labelX).attr('y', 5)
          .attr('text-anchor', textAnchor).attr('fill', '#8a9ab0').attr('font-size', '8px')
          .text(rl2);
      }

      nodeG.append('title')
        .text(`${idea.title}\nÉtape: ${STAGE_LABELS[stage]}\nScore: ${idea.averageScore.toFixed(1)}/10`);

      nodeG
        .on('mouseenter', function () {
          d3.select(this).transition().duration(150).attr('transform', `translate(${nx},${ny}) scale(1.5)`);
        })
        .on('mouseleave', function () {
          d3.select(this).transition().duration(150).attr('transform', `translate(${nx},${ny}) scale(1)`);
        });
    });

  }, [tree, selectedId]);

  const closeModal = () => { setSelectedDetail(null); setSelectedId(null); };
  const stage = selectedDetail ? LEVEL_TO_STAGE[selectedDetail.level] : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ background: 'var(--bg-deep)' }} />

      {loadingDetail && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 50 }}>
          <div className="loading-pulse" />
        </div>
      )}

      {detailError && (
        <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, width: '320px' }}>
          <ErrorBanner message="Impossible de charger cette idée. Clique sur un autre nœud pour réessayer." onDismiss={() => setDetailError(false)} />
        </div>
      )}

      {selectedDetail && stage === 'bud'    && <BourGeonModal idea={selectedDetail} onClose={closeModal} onVote={onVoteIdea} onAddArgument={onAddArgument} onPromote={handlePromote} onDelete={handleDelete} />}
      {selectedDetail && stage === 'flower' && <FleurModal    idea={selectedDetail} onClose={closeModal} onVote={onVoteIdea} onAddAmendment={onAddAmendment} onPromote={handlePromote} onDelete={handleDelete} />}
      {selectedDetail && stage === 'fruit'  && <FruitModal    idea={selectedDetail} onClose={closeModal} onVote={onVoteIdea} onPromote={handlePromote} onDelete={handleDelete} />}
      {selectedDetail && stage === 'leaf'   && <FeuilleModal  idea={selectedDetail} onClose={closeModal} onDelete={handleDelete} />}

      <TreeLegend />
    </div>
  );
};

export default TreeCanvas;
