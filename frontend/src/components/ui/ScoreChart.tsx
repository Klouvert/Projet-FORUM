interface ScoreChartProps {
  averageScore: number;
  voteCount: number;
}

const ScoreChart = ({ averageScore, voteCount }: ScoreChartProps) => {
  const pct = Math.round((averageScore / 10) * 100);
  const color = averageScore >= 6 ? '#66bb6a' : averageScore >= 4 ? '#ffa726' : '#ef5350';

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color }}>
            {averageScore.toFixed(1)}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '2px' }}>/10</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{voteCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>vote{voteCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div style={{
        height: '6px',
        background: 'var(--border)',
        borderRadius: '99px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '99px',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {voteCount === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Aucun vote pour l'instant.
        </p>
      )}
    </div>
  );
};

export default ScoreChart;
