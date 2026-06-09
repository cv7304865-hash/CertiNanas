import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Star, MessageSquare, Briefcase, LogOut, CheckCircle, ChevronRight, Clock, User, DollarSign, Calendar, Upload, File, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

type Servicio = {
  Id: number;
  FechaServicio: string;
  TotalHoras: number;
  TarifaHora: number;
  Total: number;
  Subtotal: number;
  TarifaPlataforma: number;
  Estado: string;
  HoraInicio: string;
  HoraFin: string;
  TipoServicio: string;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  MenorNombre: string;
  MenorDiagnostico: string;
};

type PerfilCuidadora = {
  user: { Id: number; Nombres: string; Apellidos: string; Email: string; Telefono: string };
  cuidadora: { Id: number; AniosExperiencia: number; TarifaHora: number; DescripcionCorta: string; CalificacionPromedio: number; TotalResenas: number };
  especialidades: string[];
  areas: string[];
  documentos: { TipoRequisito: string; NombreArchivo: string; Peso: string; Estado: string }[];
  stats: { CalificacionPromedio: number; TotalResenas: number };
  postulacion: { Id: number; Estado: string } | null;
  tiposRequeridos: string[];
};

type CaregiverPanelProps = {
  onNavigate?: (view: string) => void;
};

export function CaregiverPanel({ onNavigate }: CaregiverPanelProps) {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState<PerfilCuidadora | null>(null);
  const [bio, setBio] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'perfil' | 'servicios'>('perfil');
  const [servicios, setServicios] = useState<Servicio[]>([]);
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

  useEffect(() => {
    if (tab !== 'servicios') return;
    fetch('/api/cuidadora/servicios', { headers })
      .then(r => r.json())
      .then(setServicios)
      .catch(() => {});
  }, [tab]);

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
    if (['TEA', 'TDAH'].includes(e)) return 'bg-[#f6a5c0] text-white border-0';
    if (e === 'Primeros Auxilios') return 'bg-[#9d85b6] text-white border-0';
    return 'bg-[#cc8db3] text-white border-0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7C2CA] via-[#9D85B6]/40 to-[#837AB6]/20">
      {/* Navbar Oscura */}
      <header className="bg-[#250e2c]/80 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button
                onClick={() => setTab('perfil')}
                className={`text-sm pb-0.5 ${tab === 'perfil' ? 'font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0]' : 'text-white/70 hover:text-white transition-colors'}`}
              >Mi Perfil</button>
              <button
                onClick={() => setTab('servicios')}
                className={`text-sm pb-0.5 ${tab === 'servicios' ? 'font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0]' : 'text-white/70 hover:text-white transition-colors'}`}
              >Servicios</button>
              <button
                onClick={() => onNavigate?.('messages')}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <ProfileAvatar size={80} />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{perfil.user.Nombres} {perfil.user.Apellidos}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-500">Cuidadora Especializada</span>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#f6a5c0] text-white text-xs font-bold">
                    <CheckCircle className="w-3 h-3" /> Perfil Verificado
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(perfil.stats.CalificacionPromedio) ? 'text-[#cc8db3] fill-[#cc8db3]' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    ({perfil.stats.CalificacionPromedio} · {perfil.stats.TotalResenas} reseñas)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'perfil' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Perfil Profesional</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Biografía */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Biografía</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50 focus:border-transparent resize-none"
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
                className="w-full rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50 focus:border-transparent"
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
                className="w-full rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50 focus:border-transparent"
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
                  <span key={e} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${getColorForEspecialidad(e)}`}>
                    {e}
                  </span>
                ))}
                {perfil.areas.map(a => (
                  <span key={a} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#cc8db3] text-white">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documentos cargados / Subir documentos */}
          {perfil && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {perfil.postulacion?.Estado === 'Aprobada' ? 'Documentos aprobados' : 'Documentos de postulación'}
              </label>
              {perfil.documentos.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {perfil.documentos.map((d, i) => (
                    <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-sm">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">{d.TipoRequisito}</span>
                      <span className="text-gray-400 text-xs">({d.Peso})</span>
                      {d.Estado === 'Aprobado' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : d.Estado === 'Rechazado' ? (
                        <span className="text-xs text-red-600 font-medium">Rechazado</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Pendiente</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {perfil.postulacion?.Estado !== 'Aprobada' && (
                <UploadDocs postulacionId={perfil.postulacion?.Id} tiposRequeridos={perfil.tiposRequeridos} headers={headers} />
              )}
            </div>
          )}

          {/* Botón Guardar */}
          <div className="flex justify-end mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={guardar}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#837ab6] via-[#9d85b6] to-[#f6a5c0] text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
            >
              {saving ? 'Guardando...' : saved ? (
                <><CheckCircle className="w-4 h-4" /> Guardado</>
              ) : (
                <>Guardar cambios <ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Lista de Servicios */}
      {tab === 'servicios' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Mis Servicios</h2>
          {servicios.length === 0 ? (
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No tienes servicios asignados aún</p>
              <p className="text-gray-400 text-sm mt-1">Los servicios aparecerán aquí cuando una familia te contrate</p>
            </div>
          ) : (
            <div className="space-y-3">
              {servicios.map(s => {
                const badgeColor: Record<string, string> = {
                  Pendiente: 'bg-[#f6a5c0] text-white',
                  Confirmada: 'bg-[#9d85b6] text-white',
                  Completado: 'bg-[#cc8db3] text-white',
                  Rechazado: 'bg-red-500/80 text-white',
                };
                return (
                  <div key={s.Id} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">{s.FamiliaNombres} {s.FamiliaApellidos}</span>
                          <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${badgeColor[s.Estado] || 'bg-white/20 backdrop-blur-sm text-gray-700'}`}>
                            {s.Estado}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {s.FechaServicio}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {s.HoraInicio} - {s.HoraFin}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {s.MenorNombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" /> S/ {s.Total.toFixed(2)}
                          </span>
                        </div>
                        {s.MenorDiagnostico && (
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-[#cc8db3] text-white">
                            {s.MenorDiagnostico}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
      </div>
    </div>
  );
}

function UploadDocs({ postulacionId, tiposRequeridos, headers }: { postulacionId?: number; tiposRequeridos: string[]; headers: Record<string, string> }) {
  const [tipo, setTipo] = useState(tiposRequeridos[0] || 'DNI');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const subir = async () => {
    if (!file) return setMsg('Selecciona un archivo');
    setUploading(true);
    setMsg('');
    const form = new FormData();
    form.append('archivo', file);
    form.append('tipo', tipo);
    try {
      const r = await fetch('/api/cuidadora/documentos', { method: 'POST', headers: { 'x-user-id': headers['x-user-id'] }, body: form });
      const data = await r.json();
      if (r.ok) { setMsg('Documento subido correctamente'); setFile(null); setTimeout(() => setMsg(''), 2500); }
      else setMsg(data.error || 'Error al subir');
    } catch { setMsg('Error de conexión'); }
    setUploading(false);
  };

  return (
    <div className="border border-dashed border-white/50 bg-white/10 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">Subir documento</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="rounded-lg border border-white/40 bg-white/30 backdrop-blur-sm px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50">
            {tiposRequeridos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Archivo (PDF, máx 10MB)</label>
          <input type="file" accept=".pdf,.jpg,.png" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/30 file:text-white hover:file:bg-white/40" />
        </div>
        <button onClick={subir} disabled={uploading || !file} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#cc8db3] text-white rounded-lg text-sm font-bold hover:bg-[#b87a9f] transition-colors disabled:opacity-50">
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
      </div>
      {msg && <p className={`text-xs mt-2 ${msg.includes('correctamente') ? 'text-emerald-600' : 'text-red-600'}`}>{msg}</p>}
    </div>
  );
}
