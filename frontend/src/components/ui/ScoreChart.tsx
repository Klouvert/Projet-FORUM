import type { VoteStats } from '../../types';

interface ScoreChartProps {
  stats: VoteStats;
}

const ScoreChart = ({ stats }: ScoreChartProps) => {
  const maxCount = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div style={{ padding: '12px 0' }}>

      {/* Score moyen + seuil 60% */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {stats.average.toFixed(1)}<span style={{ fontSize: '14px', color: '#888' }}>/10</span>
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Score moyen</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFC107' }}>
            60% ≥ {stats.threshold60}/10
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Seuil 60%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2196F3' }}>
            {stats.totalVotes}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Votes</div>
        </div>
      </div>

      {/* Graphique de répartition en barres verticales */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        height: '80px',
        padding: '0 4px',
      }}>
        {Array.from({ length: 10 }, (_, i) => {
          const note = i + 1;
          const count = stats.distribution[note] ?? 0;
          const heightPct = (count / maxCount) * 100;
          const isAbove60 = note >= stats.threshold60;

          return (
            <div key={note} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '9px', color: '#666' }}>{count}</span>
              <div style={{
                width: '100%',
                height: `${heightPct}%`,
                minHeight: count > 0 ? '4px' : '0',
                background: isAbove60 ? '#4CAF50' : '#e53935',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.3s ease',
              }} />
              <span style={{ fontSize: '9px', color: '#555' }}>{note}</span>
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', background: '#4CAF50', borderRadius: '2px' }} />
          <span style={{ fontSize: '11px', color: '#888' }}>≥ seuil 60%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', background: '#e53935', borderRadius: '2px' }} />
          <span style={{ fontSize: '11px', color: '#888' }}>{'< seuil 60%'}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreChart;