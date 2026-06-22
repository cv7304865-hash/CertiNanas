import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type Familiar = {
  Id: number; Nombres: string; Apellidos: string; Email: string;
  Telefono: string; Rol: string; IdUsuario: number;
};

export function MiembrosFamiliares() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [miembros, setMiembros] = useState<Familiar[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Observador');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const loadMiembros = async () => {
    try {
      const r = await fetch('/api/familiares/miembros', { headers });
      const data = await r.json();
      setMiembros(data.miembros || []);
    } catch {}
  };

  useEffect(() => { loadMiembros(); }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setAdding(true);
    setMessage(null);
    try {
      const r = await fetch('/api/familiares/agregar', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: email.trim(), rol }),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Miembro agregado correctamente' });
        setEmail('');
        setShowAddForm(false);
        loadMiembros();
      } else {
        const data = await r.json();
        setMessage({ type: 'danger', text: data.error || 'Error al agregar' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
    setAdding(false);
  };

  const handleRemove = async (idUsuario: number) => {
    try {
      const r = await fetch('/api/familiares/remover', {
        method: 'POST',
        headers,
        body: JSON.stringify({ idUsuario }),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Miembro removido' });
        loadMiembros();
      } else {
        const data = await r.json();
        setMessage({ type: 'danger', text: data.error || 'Error al remover' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-white">Miembros Familiares</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-[rgba(246,165,192,0.15)] text-[#F6A5C0] text-xs font-bold hover:bg-[rgba(246,165,192,0.25)] transition-colors"
        >
          + Agregar
        </button>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">Administra los miembros de tu grupo familiar</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-white mb-3">Agregar miembro</h3>
          <div className="space-y-3">
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email del familiar"
              className="w-full px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
            />
            <select value={rol} onChange={e => setRol(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
            >
              <option value="Observador">Observador</option>
              <option value="Administrador">Administrador</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={!email.trim() || adding}
                className="flex-1 px-4 py-2 rounded-xl bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
              >{adding ? 'Agregando...' : 'Agregar'}</button>
              <button onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-xs hover:text-white transition-colors"
              >Cancelar</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {miembros.length === 0 && (
          <div className="text-center py-12 text-[#6667AB] text-sm">
            No hay miembros agregados
          </div>
        )}
        {miembros.map(m => (
          <motion.div key={m.Id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(246,165,192,0.15)] flex items-center justify-center text-[#F6A5C0] text-sm font-bold">
              {m.Nombres.charAt(0)}{m.Apellidos.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{m.Nombres} {m.Apellidos}</p>
              <p className="text-[#6667AB] text-xs">{m.Email}</p>
              <p className="text-[#6667AB] text-[10px]">{m.Telefono}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                m.Rol === 'Administrador' ? 'bg-[rgba(246,165,192,0.15)] text-[#F6A5C0]' : 'bg-[rgba(102,103,171,0.15)] text-[#6667AB]'
              }`}>
                {m.Rol}
              </span>
              <button onClick={() => handleRemove(m.IdUsuario)}
                className="text-[#6667AB] hover:text-red-400 transition-colors text-xs"
              >✕</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
