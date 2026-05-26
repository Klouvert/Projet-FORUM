import { useState } from 'react';
import type { IdeaNode, Domain } from '../../types';
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
  onSelectIdea: (idea: IdeaNode) => void;
}

const SearchPanel = ({ ideas, onSelectIdea }: SearchPanelProps) => {
  const [keyword, setKeyword] = useState('');
  const [stage, setStage] = useState<StageFilter>('');
  const [domain, setDomain] = useState<Domain | ''>('');

  const results = ideas.filter((idea) => {
    const matchKeyword = !keyword || idea.title.toLowerCase().includes(keyword.toLowerCase());
    const matchStage = !stage || LEVEL_TO_STAGE[idea.level] === stage;
    const matchDomain = !domain || idea.domain === domain;
    return matchKeyword && matchStage && matchDomain;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <div>
        <label style={labelStyle}>Mot-clé</label>
        <input type="text" placeholder="Rechercher..." value={keyword}
          onChange={(e) => setKeyword(e.target.value)} style={inputStyle} />
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
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {results.map((idea) => {
            const stageKey = LEVEL_TO_STAGE[idea.level];
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
                </span>
              </li>
            );
          })}
          {results.length === 0 && keyword && (
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
