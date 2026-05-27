import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import api from '../../api/axios';
import type { Tree, IdeaNode, IdeaDetail, Branch } from '../../types';
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
  onUpdateIdea: (ideaId: string, title: string, content: string) => Promise<void>;
  onUpdateArgument: (id: string, content: string) => Promise<void>;
  onDeleteArgument: (id: string) => Promise<void>;
  onUpdateAmendment: (id: string, content: string) => Promise<void>;
  onDeleteAmendment: (id: string) => Promise<void>;
  requestOpenIdeaId?: string | null;
  onIdeaOpened?: () => void;
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
const TIP_EXTRA       = 32; /* = FIRST_NODE_DIST - 18, so gap last-node→"+" ≈ 50 */
const TRUNK_H_MIN     = 260;

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

function trunkPath(cx: number, cy: number, h: number) {
  const bw = 28, tw = 10;
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
  tree, onVoteIdea, onAddArgument, onAddAmendment, onPromote, onRequestCreate,
  onDeleteIdea, onUpdateIdea, onUpdateArgument, onDeleteArgument, onUpdateAmendment, onDeleteAmendment,
  requestOpenIdeaId, onIdeaOpened,
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

  /* Ouvre la modale depuis un déclencheur externe (ex: résultat de recherche) */
  useEffect(() => {
    if (!requestOpenIdeaId || !tree) return;
    const idea = tree.ideas.find(i => i.id === requestOpenIdeaId);
    if (idea) {
      openDetail(idea);
      onIdeaOpened?.();
    }
  }, [requestOpenIdeaId]);

  useEffect(() => {
    if (!tree || !svgRef.current) return;
    const t = tree; // alias pour les closures imbriquées (TypeScript narrowing)

    const width  = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const cx = width / 2;
    const cy = Math.round(height * 0.76);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    /* Tronc */
    const trunkGrad = defs.append('linearGradient').attr('id', 'trunk-grad')
      .attr('x1', '0%').attr('y1', '100%').attr('x2', '0%').attr('y2', '0%');
    trunkGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3b2510');
    trunkGrad.append('stop').attr('offset', '100%').attr('stop-color', '#7a5c38');

    /* Ciel — du haut (bleu profond) vers la base du tronc (bleu horizon clair) */
    const skyGrad = defs.append('linearGradient').attr('id', 'sky-grad')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', String(cy));
    skyGrad.append('stop').attr('offset', '0%').attr('stop-color', '#6bb4d4');
    skyGrad.append('stop').attr('offset', '100%').attr('stop-color', '#c9e9f7');

    /* Sol — de la base du tronc (vert herbe) vers le bas (vert profond) */
    const groundGrad = defs.append('linearGradient').attr('id', 'ground-grad')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0').attr('y1', String(cy)).attr('x2', '0').attr('y2', String(height));
    groundGrad.append('stop').attr('offset', '0%').attr('stop-color', '#8dc97c');
    groundGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4a7a2e');

    const g = svg.append('g');
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.25, 3])
        .on('zoom', (e) => g.attr('transform', e.transform))
    );

    /* Arrière-plan adaptatif dans le groupe zoomable — suit le zoom et le pan */
    g.append('rect').attr('x', -100000).attr('y', -100000)
      .attr('width', 200000).attr('height', 100000 + cy)
      .attr('fill', 'url(#sky-grad)');
    g.append('rect').attr('x', -100000).attr('y', cy)
      .attr('width', 200000).attr('height', 100000)
      .attr('fill', 'url(#ground-grad)');

    /* ── Socle ───────────────────────────────────────────────── */
    g.append('ellipse').attr('cx', cx).attr('cy', cy + 16)
      .attr('rx', 120).attr('ry', 20)
      .attr('fill', '#3b2510').attr('opacity', 0.75);

    /* ── Racines dans le sol ─────────────────────────────────── */
    const seeds = t.trunkValues;
    const rootDepth = 62;
    seeds.forEach((value, i) => {
      const spacing = Math.min(seeds.length * 48, 220) / Math.max(seeds.length - 1, 1);
      const rx = cx + (i - (seeds.length - 1) / 2) * spacing;
      const ry = cy + rootDepth;
      /* courbe bézier : part du pied du tronc, s'éloigne latéralement */
      g.append('path')
        .attr('d', `M ${cx} ${cy + 8} C ${cx} ${cy + 35}, ${rx} ${cy + 35}, ${rx} ${ry}`)
        .attr('stroke', '#5c3818').attr('stroke-width', 2.5)
        .attr('fill', 'none').attr('opacity', 0.75).attr('stroke-linecap', 'round');
      /* nœud terminal de la racine */
      g.append('circle').attr('cx', rx).attr('cy', ry).attr('r', 3.5)
        .attr('fill', '#a5d6a7').attr('opacity', 0.9);
      /* nom de la valeur fondatrice */
      const anchor = Math.abs(rx - cx) < 6 ? 'middle' : rx > cx ? 'start' : 'end';
      const lx = rx + (Math.abs(rx - cx) < 6 ? 0 : rx > cx ? 6 : -6);
      g.append('text').attr('x', lx).attr('y', ry + 14)
        .attr('text-anchor', anchor)
        .attr('fill', '#d4f0d4').attr('font-size', '10px').attr('font-weight', '500')
        .attr('stroke', 'rgba(20,50,10,0.75)').attr('stroke-width', '2.5').attr('paint-order', 'stroke fill')
        .text(value.name);
    });

    /* bouton + graine */
    appendAddButton(g, cx + 100, cy + 16, () => onRequestCreate(undefined));

    /* ── Layout : tronc grandit selon les branches racines ───── */
    const rootBranches = t.branches.filter(b => b.parentBranchId === null);
    const totalLevels  = Math.ceil(rootBranches.length / 2);
    /* 80 px minimum entre niveaux de branches (zone = 70 % du tronc) */
    const trunkH = Math.max(TRUNK_H_MIN, Math.round(Math.max(0, totalLevels - 1) * 80 / 0.70));

    /* ── Tronc ───────────────────────────────────────────────── */
    g.append('path').attr('d', trunkPath(cx, cy, trunkH))
      .attr('fill', 'url(#trunk-grad)')
      .attr('filter', 'drop-shadow(0 4px 10px rgba(0,0,0,0.28))');

    /* ── Rendu récursif d'une branche et de ses sous-branches ── */
    function renderBranchAt(
      branch: Branch,
      attachX: number,
      attachY: number,
      angleDeg: number,   // angle depuis la verticale (+ = droite, - = gauche)
      depth: number,      // 0 = racine, 1 = enfant, 2 = petit-enfant
      animDelay: number,  // index pour l'animation d'entrée
      colorFrac: number,  // 0-1 pour interpolation de couleur
    ): void {
      const angleRad = angleDeg * (Math.PI / 180);
      const unitX    = Math.sin(angleRad);
      const unitY    = -Math.cos(angleRad);
      const side     = angleDeg >= 0 ? 1 : -1;

      /* Nœuds triés par avancement */
      const branchIdeas = t.ideas
        .filter(idea => idea.branchId === branch.id)
        .sort((a, b) => {
          const sa = LEVEL_TO_STAGE[a.level] ?? 'bud';
          const sb = LEVEL_TO_STAGE[b.level] ?? 'bud';
          return STAGE_ORDER[sa] - STAGE_ORDER[sb];
        });
      const ideaCount = branchIdeas.length;

      /* Les sous-branches sont plus courtes */
      const lenMult    = [1, 0.72, 0.56][depth] ?? 0.56;
      const nodeStep   = NODE_SPACING * lenMult;
      const firstDist  = FIRST_NODE_DIST * lenMult;
      const branchLength = Math.max(
        60 * lenMult,
        firstDist + Math.max(0, ideaCount - 1) * nodeStep + TIP_EXTRA * lenMult,
      );

      const bx = attachX + unitX * branchLength;
      const by = attachY + unitY * branchLength;

      /* Épaisseur */
      const sw = depth === 0
        ? Math.max(2.5, Math.min(ideaCount * 1.2 + 3, 14))
        : Math.max(1.5, Math.min(ideaCount * 0.8 + 2.5, 9 - depth * 2));

      /* Couleur */
      const branchColor = depth === 0
        ? d3.interpolateRgb('#8b6340', '#7aaa50')(colorFrac)
        : depth === 1
          ? d3.interpolateRgb('#7aaa50', '#5a9a40')(colorFrac)
          : '#4a8830';

      /* Courbe bézier */
      const pathEl = g.append('path')
        .attr('d', bezierBranch(attachX, attachY, bx, by))
        .attr('stroke', branchColor).attr('stroke-width', sw)
        .attr('stroke-linecap', 'round').attr('fill', 'none');
      const totalLen = (pathEl.node() as SVGPathElement).getTotalLength();
      pathEl.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
        .transition().duration(600).delay(animDelay * 80).ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      /* Nom de la branche */
      if (depth === 0) {
        const labelAnchor = side > 0 ? 'start' : 'end';
        const labelX = cx + side * 42;
        const labelY = attachY - 5;
        g.append('text').attr('x', labelX).attr('y', labelY)
          .attr('text-anchor', labelAnchor)
          .attr('fill', '#5a4030').attr('font-size', '11px').attr('font-weight', '500')
          .attr('letter-spacing', '0.3px')
          .attr('stroke', 'rgba(255,252,245,0.9)').attr('stroke-width', '3').attr('paint-order', 'stroke fill')
          .text(branch.name);
      } else {
        /* Sous-branche : étiquette près du point d'attache */
        const labelAnchor = side > 0 ? 'start' : 'end';
        const labelX = attachX + side * 14;
        const labelY = attachY - 4;
        g.append('text').attr('x', labelX).attr('y', labelY)
          .attr('text-anchor', labelAnchor)
          .attr('fill', '#4a5530').attr('font-size', '9px').attr('font-weight', '500')
          .attr('stroke', 'rgba(255,252,245,0.85)').attr('stroke-width', '2.5').attr('paint-order', 'stroke fill')
          .text(branch.name);
      }

      const pathNode = pathEl.node() as SVGPathElement;

      /* ── Nœuds ────────────────────────────────────────────── */
      branchIdeas.forEach((idea: IdeaNode, j: number) => {
        const dist = firstDist + j * nodeStep;
        const alt  = j % 2 === 0 ? -1 : 1;
        const t    = Math.min(dist / branchLength, 0.98);
        const pt   = pathNode.getPointAtLength(t * totalLen);
        const nx = pt.x, ny = pt.y;

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

        const eps    = 1;
        const ptA    = pathNode.getPointAtLength(Math.max(0,        t * totalLen - eps));
        const ptB    = pathNode.getPointAtLength(Math.min(totalLen, t * totalLen + eps));
        const tanX   = ptB.x - ptA.x, tanY = ptB.y - ptA.y;
        const tanLen = Math.sqrt(tanX * tanX + tanY * tanY) || 1;
        const lpX    = -tanY / tanLen;
        const lpY    =  tanX / tanLen;

        const labelGap   = radius + 6;
        const lx         = alt * lpX * labelGap;
        const ly         = alt * lpY * labelGap;
        const textAnchor = Math.abs(lx) < 3 ? 'middle' : lx > 0 ? 'start' : 'end';
        const [line1, line2] = wrapTitle(idea.title);
        const lineH = 9;
        const yBase = ly + (alt < 0 ? -(line2 ? lineH : 2) : 2);

        nodeG.append('text')
          .attr('x', lx).attr('y', yBase).attr('text-anchor', textAnchor)
          .attr('fill', '#5a4030').attr('font-size', '8px')
          .attr('stroke', 'rgba(255,252,245,0.9)').attr('stroke-width', '3').attr('paint-order', 'stroke fill')
          .text(line1);
        if (line2) {
          nodeG.append('text')
            .attr('x', lx).attr('y', yBase + lineH).attr('text-anchor', textAnchor)
            .attr('fill', '#5a4030').attr('font-size', '8px')
            .attr('stroke', 'rgba(255,252,245,0.9)').attr('stroke-width', '3').attr('paint-order', 'stroke fill')
            .text(line2);
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

      /* ── Sous-branches récursives ─────────────────────────── */
      const children = t.branches.filter(b => b.parentBranchId === branch.id);

      if (children.length > 0) {
        /* Éventail plus large pour éviter la superposition.
           Enfant unique : déviation latérale de 22° vers l'extérieur.
           Plusieurs enfants : 42° entre chaque frère. */
        const spread = 42;
        children.forEach((child, ci) => {
          const childOffset = children.length === 1
            ? side * 22                                             // seul enfant → déviation côté extérieur
            : (ci - (children.length - 1) / 2) * spread;          // plusieurs → éventail centré
          renderBranchAt(
            child, bx, by,
            angleDeg + childOffset,
            depth + 1,
            animDelay + ci + 1,
            colorFrac,
          );
        });

        /* Bouton + idée décalé perpendiculairement (évite le chevauchement avec les sous-branches) */
        const perpX = -unitY;  // perpendiculaire à la direction de la branche
        const perpY =  unitX;
        appendAddButton(
          g,
          bx + perpX * side * 22,
          by + perpY * side * 22,
          () => onRequestCreate(branch.id),
        );
      } else {
        /* Pas de sous-branche : bouton + dans le prolongement classique */
        appendAddButton(g, bx + unitX * 18, by + unitY * 18, () => onRequestCreate(branch.id));
      }
    }

    /* ── Branches racines alternées sur le tronc ─────────────── */
    rootBranches.forEach((branch, i) => {
      const side       = i % 2 === 0 ? 1 : -1;
      const levelIndex = Math.floor(i / 2);
      const levelFrac  = totalLevels > 1 ? levelIndex / (totalLevels - 1) : 0.5;

      const attachY  = cy - trunkH * (0.20 + levelFrac * 0.70);
      const attachX  = cx + side * 10;
      const angleDeg = side * (58 - levelFrac * 32);

      renderBranchAt(branch, attachX, attachY, angleDeg, 0, i, levelFrac);
    });

    /* ── Idées sans branche (au-dessus du tronc) ─────────────── */
    const rootIdeas = t.ideas.filter(idea => idea.branchId === null);
    const trunkTopY = cy - trunkH;
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
        .attr('text-anchor', textAnchor).attr('fill', '#5a4030').attr('font-size', '8px')
        .attr('stroke', 'rgba(255,252,245,0.9)').attr('stroke-width', '3').attr('paint-order', 'stroke fill')
        .text(rl1);
      if (rl2) {
        nodeG.append('text').attr('x', labelX).attr('y', 5)
          .attr('text-anchor', textAnchor).attr('fill', '#5a4030').attr('font-size', '8px')
          .attr('stroke', 'rgba(255,252,245,0.9)').attr('stroke-width', '3').attr('paint-order', 'stroke fill')
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
      <svg ref={svgRef} width="100%" height="100%" />

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

      {selectedDetail && stage === 'bud'    && <BourGeonModal idea={selectedDetail} onClose={closeModal} onVote={onVoteIdea} onAddArgument={onAddArgument} onPromote={handlePromote} onDelete={handleDelete} onUpdateIdea={onUpdateIdea} onUpdateArgument={onUpdateArgument} onDeleteArgument={onDeleteArgument} />}
      {selectedDetail && stage === 'flower' && <FleurModal    idea={selectedDetail} onClose={closeModal} onVote={onVoteIdea} onAddAmendment={onAddAmendment} onPromote={handlePromote} onDelete={handleDelete} onUpdateIdea={onUpdateIdea} onUpdateAmendment={onUpdateAmendment} onDeleteAmendment={onDeleteAmendment} />}
      {selectedDetail && stage === 'fruit'  && <FruitModal    idea={selectedDetail} onClose={closeModal} onVote={onVoteIdea} onPromote={handlePromote} onDelete={handleDelete} onUpdateIdea={onUpdateIdea} />}
      {selectedDetail && stage === 'leaf'   && <FeuilleModal  idea={selectedDetail} onClose={closeModal} onDelete={handleDelete} onUpdateIdea={onUpdateIdea} />}

      <TreeLegend />
    </div>
  );
};

export default TreeCanvas;
