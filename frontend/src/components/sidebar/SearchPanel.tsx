import { useState } from 'react';
import type { NodeStatus, Domain } from '../../types';

interface Filters {
  keyword: string;
  status: NodeStatus | '';
  domain: Domain | '';
  period: 'week' | 'month' | 'custom' | '';
}

const SearchPanel = () => {
  const [filters, setFilters] = useState<Filters>({
    keyword: '',
    status: '',
    domain: '',
    period: '',
  });

  const handleSearch = () => {
    console.log('Filtres appliqués :', filters);
    // TODO : connecter à l'API
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Mot-clé */}
      <div>
        <label style={labelStyle}>Mot-clé</label>
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          style={inputStyle}
        />
      </div>

      {/* Statut */}
      <div>
        <label style={labelStyle}>Statut</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as NodeStatus | '' })}
          style={inputStyle}
        >
          <option value="">Tous</option>
          <option value="bourgeon">Bourgeon</option>
          <option value="fleur">Fleur</option>
          <option value="fruit">Fruit</option>
          <option value="feuille">Feuille</option>
        </select>
      </div>

      {/* Domaine */}
      <div>
        <label style={labelStyle}>Domaine</label>
        <select
          value={filters.domain}
          onChange={(e) => setFilters({ ...filters, domain: e.target.value as Domain | '' })}
          style={inputStyle}
        >
          <option value="">Tous</option>
          <option value="ecologie">Écologie</option>
          <option value="social">Social</option>
          <option value="economie">Économie</option>
          <option value="culture">Culture</option>
        </select>
      </div>

      {/* Période */}
      <div>
        <label style={labelStyle}>Période</label>
        <select
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value as Filters['period'] })}
          style={inputStyle}
        >
          <option value="">Toutes</option>
          <option value="week">Dernière semaine</option>
          <option value="month">Dernier mois</option>
        </select>
      </div>

      {/* Bouton */}
      <button onClick={handleSearch} style={buttonStyle}>
        Rechercher
      </button>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#888',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: '#1a1a2e',
  border: '1px solid #0f3460',
  borderRadius: '6px',
  color: '#e0e0e0',
  fontSize: '13px',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  background: '#0f3460',
  color: '#e0e0e0',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  marginTop: '4px',
};

export default SearchPanel;