import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Star, MessageSquare, Briefcase, LogOut, CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type PerfilCuidadora = {
  user: { Id: number; Nombres: string; Apellidos: string; Email: string; Telefono: string };
  cuidadora: { Id: number; AniosExperiencia: number; TarifaHora: number; DescripcionCorta: string; CalificacionPromedio: number; TotalResenas: number };
  especialidades: string[];
  areas: string[];
  documentos: { TipoRequisito: string; NombreArchivo: string; Peso: string; Estado: string }[];
  stats: { CalificacionPromedio: number; TotalResenas: number };
};

export function CaregiverPanel() {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState<PerfilCuidadora | null>(null);
  const [bio, setBio] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  useEffect(() => {
    fetch('/api/cuidadora/perfil', { headers })
      .then(r => r.json())
      .then(data => {
        setPerfil(data);
        setBio(data.cuidadora.DescripcionCorta || '');
        setTarifa(String(data.cuidadora.TarifaHora || ''));
        setExperiencia(String(data.cuidadora.AniosExperiencia || ''));
      })
      .catch(() => {});
  }, []);

  const guardar = async () => {
    setSaving(true);
    try {
      await fetch('/api/cuidadora/perfil', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ bio, tarifaHora: parseFloat(tarifa) || 0, aniosExperiencia: parseInt(experiencia) || 0 }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const getColorForEspecialidad = (e: string) => {
    if (['TEA', 'TDAH'].includes(e)) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (e === 'Primeros Auxilios') return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Oscura */}
      <header className="bg-[#1E293B] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#F59E0B] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button className="text-sm font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-0.5">Mi Perfil</button>
              <button className="text-sm text-white/70 hover:text-white transition-colors">Servicios</button>
              <button className="text-sm text-white/70 hover:text-white transition-colors">Mensajes</button>
              <div className="w-9 h-9 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-sm font-bold text-[#F59E0B] ml-2">
                {user?.nombres?.charAt(0) || 'C'}
              </div>
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Tarjeta de Resumen */}
        {perfil && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {perfil.user.Nombres?.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{perfil.user.Nombres} {perfil.user.Apellidos}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-500">Cuidadora Especializada</span>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> Perfil Verificado
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(perfil.stats.CalificacionPromedio) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    ({perfil.stats.CalificacionPromedio} · {perfil.stats.TotalResenas} reseñas)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formulario Editar Perfil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Perfil Profesional</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Biografía */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Biografía</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none"
                placeholder="Especialista en TEA y TDAH con 5 años de experiencia..."
              />
            </div>
            {/* Tarifa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tarifa por hora (S/)</label>
              <input
                type="number"
                step="0.01"
                value={tarifa}
                onChange={e => setTarifa(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
                placeholder="35.00"
              />
            </div>
            {/* Experiencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Años de experiencia</label>
              <input
                type="number"
                value={experiencia}
                onChange={e => setExperiencia(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
                placeholder="5"
              />
            </div>
          </div>

          {/* Especialidades */}
          {perfil && perfil.especialidades.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Especialidades</label>
              <div className="flex flex-wrap gap-2">
                {perfil.especialidades.map(e => (
                  <span key={e} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getColorForEspecialidad(e)}`}>
                    {e}
                  </span>
                ))}
                {perfil.areas.map(a => (
                  <span key={a} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border bg-purple-50 text-purple-800 border-purple-200">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documentos cargados */}
          {perfil && perfil.documentos.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Documentos cargados</label>
              <div className="flex flex-wrap gap-3">
                {perfil.documentos.map((d, i) => (
                  <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{d.TipoRequisito}.pdf</span>
                    {d.Estado === 'Aprobado' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Pendiente</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón Guardar */}
          <div className="flex justify-end mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={guardar}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#F59E0B] text-white rounded-xl text-sm font-bold hover:bg-[#D97706] transition-colors shadow-lg shadow-[#F59E0B]/25 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : saved ? (
                <><CheckCircle className="w-4 h-4" /> Guardado</>
              ) : (
                <>Guardar cambios <ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
