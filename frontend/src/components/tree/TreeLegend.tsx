const STAGES = [
  { label: 'Bourgeon', color: '#b39ddb', shape: 'drop'   },
  { label: 'Fleur',    color: '#f48fb1', shape: 'flower' },
  { label: 'Fruit',    color: '#ffcc80', shape: 'circle' },
  { label: 'Feuille',  color: '#a5d6a7', shape: 'leaf'   },
] as const;

const DOMAINS = [
  { label: 'Écologie', color: '#66bb6a' },
  { label: 'Social',   color: '#ef5350' },
  { label: 'Économie', color: '#42a5f5' },
  { label: 'Culture',  color: '#ffa726' },
] as const;

function ShapeIcon({ shape, color }: { shape: string; color: string }) {
  const s = 14, c = s / 2;
  switch (shape) {
    case 'drop':
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
          <path d="M 7 1 Q 12 5, 7 13 Q 2 5, 7 1 Z" fill={color} opacity={0.9} />
        </svg>
      );
    case 'flower':
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const px = c + Math.cos(rad) * 3.5, py = c + Math.sin(rad) * 3.5;
            return <ellipse key={i} cx={px} cy={py} rx={2.5} ry={1.6} transform={`rotate(${deg},${px},${py})`} fill={color} opacity={0.85} />;
          })}
          <circle cx={c} cy={c} r={1.8} fill="#fff9c4" opacity={0.9} />
        </svg>
      );
    case 'circle':
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
          <circle cx={c} cy={c} r={5} fill={color} opacity={0.92} />
          <circle cx={c - 1.5} cy={c - 1.5} r={2} fill="#fff" opacity={0.2} />
        </svg>
      );
    case 'leaf':
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
          <path d="M 7 2 Q 12 7, 7 12 Q 2 7, 7 2 Z" fill={color} opacity={0.88} transform="rotate(35,7,7)" />
        </svg>
      );
    default:
      return <div style={{ width: s, height: s, borderRadius: '50%', background: color }} />;
  }
}

const TreeLegend = () => (
  <div style={{
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(13,17,23,0.82)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    zIndex: 10,
    minWidth: '120px',
  }}>
    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '2px' }}>
      Étapes
    </p>
    {STAGES.map(({ label, color, shape }) => (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShapeIcon shape={shape} color={color} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
      </div>
    ))}

    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '6px', marginBottom: '2px' }}>
      Domaines
    </p>
    {DOMAINS.map(({ label, color }) => (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
      </div>
    ))}
  </div>
);

export default TreeLegend;
