import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Star, MessageSquare, Briefcase, LogOut, CheckCircle, ChevronRight, Clock, User, DollarSign, Calendar, Upload, File, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { CuidadoraSolicitudes } from './CuidadoraSolicitudes';

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
  const [tab, setTab] = useState<'perfil' | 'servicios' | 'solicitudes'>('perfil');
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
    if (['TEA', 'TDAH'].includes(e)) return 'bg-[#F6A5C0] text-[#210635] border-0';
    if (e === 'Primeros Auxilios') return 'bg-[#CC8DB3] text-[#210635] border-0';
    return 'bg-[#CC8DB3] text-[#210635] border-0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#F6A5C0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-[#6667AB] text-xl font-light hidden sm:inline">|</span>
              <span className="text-[#6667AB] text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button
                onClick={() => setTab('perfil')}
                className={`text-sm pb-0.5 ${tab === 'perfil' ? 'font-bold text-[#F6A5C0] border-b-2 border-[#F6A5C0]' : 'text-[#F5D5E0]/70 hover:text-white transition-colors'}`}
              >Mi Perfil</button>
              <button
                onClick={() => setTab('servicios')}
                className={`text-sm pb-0.5 ${tab === 'servicios' ? 'font-bold text-[#F6A5C0] border-b-2 border-[#F6A5C0]' : 'text-[#F5D5E0]/70 hover:text-white transition-colors'}`}
              >Servicios</button>
              <button
                onClick={() => setTab('solicitudes')}
                className={`text-sm pb-0.5 ${tab === 'solicitudes' ? 'font-bold text-[#F6A5C0] border-b-2 border-[#F6A5C0]' : 'text-[#F5D5E0]/70 hover:text-white transition-colors'}`}
              >Solicitudes</button>
              <button
                onClick={() => onNavigate?.('messages')}
                className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors"
              >Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {perfil && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <ProfileAvatar size={80} />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{perfil.user.Nombres} {perfil.user.Apellidos}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#6667AB]">Cuidadora Especializada</span>
                  {perfil.postulacion?.Estado === 'Aprobada' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[rgba(16,185,129,0.2)] text-[#6EE7B7] text-xs font-bold">
                      <CheckCircle className="w-3 h-3" /> Perfil Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[rgba(234,179,8,0.2)] text-[#FACC15] text-xs font-bold">
                      Pendiente de verificación
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(perfil.stats.CalificacionPromedio) ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                  ))}
                  <span className="text-sm text-[#6667AB] ml-2">
                    ({perfil.stats.CalificacionPromedio} · {perfil.stats.TotalResenas} reseñas)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'perfil' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Editar Perfil Profesional</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Biografía</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-4 py-3 text-sm text-white placeholder:text-[#6667AB] focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] resize-none"
                placeholder="Especialista en TEA y TDAH con 5 años de experiencia..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Tarifa por hora (S/)</label>
              <input
                type="number"
                step="0.01"
                value={tarifa}
                onChange={e => setTarifa(e.target.value)}
                className="w-full rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-4 py-3 text-sm text-white placeholder:text-[#6667AB] focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
                placeholder="35.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Años de experiencia</label>
              <input
                type="number"
                value={experiencia}
                onChange={e => setExperiencia(e.target.value)}
                className="w-full rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-4 py-3 text-sm text-white placeholder:text-[#6667AB] focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
                placeholder="5"
              />
            </div>
          </div>

          {perfil && perfil.especialidades.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-3">Especialidades</label>
              <div className="flex flex-wrap gap-2">
                {perfil.especialidades.map(e => (
                  <span key={e} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${getColorForEspecialidad(e)}`}>
                    {e}
                  </span>
                ))}
                {perfil.areas.map(a => (
                  <span key={a} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#CC8DB3] text-[#210635]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {perfil && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-3">
                {perfil.postulacion?.Estado === 'Aprobada' ? 'Documentos aprobados' : 'Documentos de postulación'}
              </label>
              {perfil.documentos.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {perfil.documentos.map((d, i) => (
                    <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(33,6,53,0.5)] backdrop-blur-sm text-sm">
                      <File className="w-4 h-4 text-[#6667AB]" />
                      <span className="text-[#F5D5E0] font-medium">{d.TipoRequisito}</span>
                      <span className="text-[#6667AB] text-xs">({d.Peso})</span>
                      {d.Estado === 'Aprobado' ? (
                        <CheckCircle className="w-4 h-4 text-[#6EE7B7]" />
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

          <div className="flex justify-end mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={guardar}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#F6A5C0] text-[#210635] rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
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

      {tab === 'solicitudes' && (
        <CuidadoraSolicitudes />
      )}

      {tab === 'servicios' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold text-white">Mis Servicios</h2>
          {servicios.length === 0 ? (
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-2xl p-12 text-center">
              <Briefcase className="w-12 h-12 text-[#6667AB] mx-auto mb-4" />
              <p className="text-[#F5D5E0] font-medium">No tienes servicios asignados aún</p>
              <p className="text-[#6667AB] text-sm mt-1">Los servicios aparecerán aquí cuando una familia te contrate</p>
            </div>
          ) : (
            <div className="space-y-3">
              {servicios.map(s => {
                const badgeColor: Record<string, string> = {
                  Pendiente: 'bg-[#F6A5C0] text-[#210635]',
                  Confirmada: 'bg-[#CC8DB3] text-[#210635]',
                  Completado: 'bg-[#CC8DB3] text-[#210635]',
                  Rechazado: 'bg-red-500/80 text-white',
                };
                return (
                  <div key={s.Id} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white">{s.FamiliaNombres} {s.FamiliaApellidos}</span>
                          <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${badgeColor[s.Estado] || 'bg-[rgba(33,6,53,0.5)] backdrop-blur-sm text-[#F5D5E0]'}`}>
                            {s.Estado}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#6667AB]">
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
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-[#CC8DB3] text-[#210635]">
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
    <div className="border-2 border-dashed border-[rgba(255,255,255,0.3)] bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
      <p className="text-sm font-semibold text-[#F5D5E0] mb-3">Subir documento</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-[#6667AB] mb-1">Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="rounded-lg bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]">
            {tiposRequeridos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#6667AB] mb-1">Archivo (PDF, máx 10MB)</label>
          <input type="file" accept=".pdf,.jpg,.png" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm text-[#F5D5E0] file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(33,6,53,0.5)] file:text-[#F5D5E0] hover:file:bg-[rgba(33,6,53,0.4)]" />
        </div>
        <button onClick={subir} disabled={uploading || !file} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#CC8DB3] text-[#210635] rounded-lg text-sm font-bold hover:bg-[#b07a9a] transition-colors disabled:opacity-50">
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
      </div>
      {msg && <p className={`text-xs mt-2 ${msg.includes('correctamente') ? 'text-[#6EE7B7]' : 'text-red-600'}`}>{msg}</p>}
    </div>
  );
}
