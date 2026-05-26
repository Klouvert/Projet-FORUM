import { useEffect, useState } from 'react';
import { Shield, ShieldOff, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface UserSummary {
  id: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

const AdminUsersPanel = () => {
  const { user: me, logout } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const r = await api.get<UserSummary[]>('/admin/users');
      setUsers(r.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status ?? 0;
      setErrorStatus(status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (u: UserSummary) => {
    setToggling(u.id);
    try {
      if (u.isAdmin) {
        await api.delete(`/admin/users/${u.id}/make-admin`);
      } else {
        await api.post(`/admin/users/${u.id}/make-admin`);
      }
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isAdmin: !x.isAdmin } : x));
    } catch {
      /* silent — le backend renvoie une erreur si tentative de retirer son propre rôle */
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>Chargement…</p>;

  if (errorStatus !== null) {
    const is403 = errorStatus === 403;
    return (
      <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(229,57,53,0.06)', border: '1px solid rgba(229,57,53,0.25)', borderRadius: '8px' }}>
        <p style={{ color: '#e57373', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          Erreur {errorStatus || 'réseau'}
        </p>
        {is403 ? (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5, marginBottom: '10px' }}>
              Votre session ne contient pas le rôle Admin. Déconnectez-vous puis reconnectez-vous pour actualiser votre token.
            </p>
            <button onClick={logout} style={{ ...refreshBtnStyle, color: '#e57373', border: '1px solid rgba(229,57,53,0.4)', borderRadius: '6px', padding: '5px 10px' }}>
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px' }}>
              {errorStatus === 404 ? 'Endpoint introuvable — le déploiement est peut-être en cours.' : 'Une erreur serveur est survenue.'}
            </p>
            <button onClick={load} style={refreshBtnStyle}><RefreshCw size={13} /> Réessayer</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Membres ({users.length})
        </span>
        <button onClick={load} title="Rafraîchir" style={refreshBtnStyle}><RefreshCw size={12} /></button>
      </div>
      <ul style={{ listStyle: 'none' }}>
        {users.map(u => (
          <li key={u.id} style={{ marginBottom: '5px' }}>
            <div style={{
              padding: '8px 10px', background: 'var(--bg-card)', borderRadius: '8px',
              border: `1px solid ${u.isAdmin ? 'rgba(126,87,194,0.4)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.displayName}
                  {u.isAdmin && <span style={{ marginLeft: '6px', fontSize: '9px', background: '#7e57c2', color: '#fff', borderRadius: '4px', padding: '1px 5px' }}>ADMIN</span>}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
              </div>
              {u.id !== me?.userId && (
                <button
                  onClick={() => toggleAdmin(u)}
                  disabled={toggling === u.id}
                  title={u.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                  style={u.isAdmin ? removeAdminBtnStyle : giveAdminBtnStyle}
                >
                  {toggling === u.id ? '…' : u.isAdmin ? <ShieldOff size={13} /> : <Shield size={13} />}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const refreshBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
  padding: '2px 4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px',
};
const giveAdminBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', background: 'rgba(126,87,194,0.12)', border: '1px solid #7e57c2',
  borderRadius: '6px', color: '#9575cd', cursor: 'pointer', padding: '0',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};
const removeAdminBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', background: 'rgba(229,57,53,0.10)', border: '1px solid #e53935',
  borderRadius: '6px', color: '#e57373', cursor: 'pointer', padding: '0',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

export default AdminUsersPanel;
