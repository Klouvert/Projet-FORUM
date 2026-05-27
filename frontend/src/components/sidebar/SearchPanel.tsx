import { useState } from 'react';
import type { IdeaNode, Domain, Branch } from '../../types';
import { LEVEL_TO_STAGE } from '../../types';

const STAGE_LABELS: Record<string, string> = {
  bud: 'Bourgeon', flower: 'Fleur', fruit: 'Fruit', leaf: 'Feuille',
};
const DOMAIN_LABELS: Record<string, string> = {
  ecology: 'Écologie', social: 'Social', economy: 'Économie', culture: 'Culture',
};

type StageFilter = 'bud' | 'flower' | 'fruit' | 'leaf' | '';

interface SearchPanelProps {
  ideas: IdeaNode[];
  branches: Branch[];
  onSelectIdea: (idea: IdeaNode) => void;
}

/** Toutes les IDs de la branche donnée et de ses descendants (BFS) */
function getDescendantIds(branchId: string, allBranches: Branch[]): Set<string> {
  const ids = new Set<string>([branchId]);
  const queue = [branchId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const b of allBranches) {
      if (b.parentBranchId === current) {
        ids.add(b.id);
        queue.push(b.id);
      }
    }
  }
  return ids;
}

/** Aplatit la hiérarchie de branches en DFS pour affichage ordonné dans le select */
function flattenBranches(allBranches: Branch[]): { branch: Branch; depth: number }[] {
  const result: { branch: Branch; depth: number }[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const b of allBranches) {
      if (b.parentBranchId === parentId) {
        result.push({ branch: b, depth });
        visit(b.id, depth + 1);
      }
    }
  }
  visit(null, 0);
  return result;
}

const DEPTH_PREFIX = ['', '└ ', '  └ '];

const SearchPanel = ({ ideas, branches, onSelectIdea }: SearchPanelProps) => {
  const [keyword, setKeyword]   = useState('');
  const [stage, setStage]       = useState<StageFilter>('');
  const [domain, setDomain]     = useState<Domain | ''>('');
  const [branchId, setBranchId] = useState<string>('');

  const flatBranches = flattenBranches(branches);

  const results = ideas.filter((idea) => {
    const matchKeyword = !keyword || idea.title.toLowerCase().includes(keyword.toLowerCase());
    const matchStage   = !stage  || LEVEL_TO_STAGE[idea.level] === stage;
    const matchDomain  = !domain || idea.domain === domain;

    let matchBranch = true;
    if (branchId) {
      const validIds = getDescendantIds(branchId, branches);
      matchBranch = idea.branchId !== null && validIds.has(idea.branchId);
    }

    return matchKeyword && matchStage && matchDomain && matchBranch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <div>
        <label style={labelStyle}>Mot-clé</label>
        <input type="text" placeholder="Rechercher..." value={keyword}
          onChange={(e) => setKeyword(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Branche</label>
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} style={inputStyle}>
          <option value="">Toutes les branches</option>
          {flatBranches.map(({ branch, depth }) => (
            <option key={branch.id} value={branch.id}>
              {DEPTH_PREFIX[depth] ?? '    └ '}{branch.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Étape</label>
        <select value={stage} onChange={(e) => setStage(e.target.value as StageFilter)} style={inputStyle}>
          <option value="">Toutes</option>
          <option value="bud">🌱 Bourgeon</option>
          <option value="flower">🌸 Fleur</option>
          <option value="fruit">🍊 Fruit</option>
          <option value="leaf">🍃 Feuille</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Domaine</label>
        <select value={domain} onChange={(e) => setDomain(e.target.value as Domain | '')} style={inputStyle}>
          <option value="">Tous</option>
          <option value="ecology">🌿 Écologie</option>
          <option value="social">🤝 Social</option>
          <option value="economy">💶 Économie</option>
          <option value="culture">🎭 Culture</option>
        </select>
      </div>

      <div style={{ marginTop: '4px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {results.length} résultat{results.length !== 1 ? 's' : ''}
          {branchId && (() => {
            const b = branches.find(x => x.id === branchId);
            return b ? <span style={{ color: 'var(--accent)' }}> dans « {b.name} »</span> : null;
          })()}
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {results.map((idea) => {
            const stageKey = LEVEL_TO_STAGE[idea.level];
            const ideaBranch = idea.branchId ? branches.find(b => b.id === idea.branchId) : null;
            return (
              <li
                key={idea.id}
                onClick={() => onSelectIdea(idea)}
                style={{
                  padding: '10px 12px', background: 'var(--bg-card)', borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {idea.title}
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {STAGE_LABELS[stageKey]} · {DOMAIN_LABELS[idea.domain]}
                  {ideaBranch && <> · {ideaBranch.name}</>}
                </span>
              </li>
            );
          })}
          {results.length === 0 && (keyword || stage || domain || branchId) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucun résultat.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: 'var(--bg-card)',
  border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px',
};

export default SearchPanel;
