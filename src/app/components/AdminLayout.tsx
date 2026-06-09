import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Shield, LayoutDashboard, FileText, UserCheck, AlertTriangle, Users, BarChart3, LogOut, MessageSquare, Send, CheckCircle, XCircle, Eye, Search, Download, TrendingUp, DollarSign, Bell, ChevronDown } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

type Postulacion = {
  Id: number; IdUsuario: number; FechaPostulacion: string; Estado: string;
  Nombres: string; Apellidos: string; Email: string; TotalDocumentos: number;
};

type Documento = {
  Id: number; IdPostulacion: number; TipoRequisito: string;
  NombreArchivo: string; Peso: string; Estado: string;
};

type Tab = 'dashboard' | 'postulaciones' | 'perfiles' | 'incidencias' | 'usuarios' | 'reportes' | 'contratos' | 'mensajes';

const navItems: { key: Tab; label: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'contratos', label: 'Contratos', icon: FileText },
  { key: 'postulaciones', label: 'Postulaciones', icon: UserCheck },
  { key: 'perfiles', label: 'Perfiles Validados', icon: Users },
  { key: 'incidencias', label: 'Incidencias', icon: AlertTriangle },
  { key: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { key: 'usuarios', label: 'Usuarios', icon: Users },
  { key: 'reportes', label: 'Reportes', icon: BarChart3 },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E] font-['Inter',system-ui,sans-serif]">
      {/* ======= HEADER ======= */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] z-50 flex items-center px-6 shadow-lg shadow-black/30">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="w-9 h-9 flex-shrink-0">
            <circle cx="20" cy="20" r="20" fill="#cc8db3" />
            <path d="M20 30 C12 24 8 19 8 15 C8 11 11 8 15 8 C17.5 8 19.5 9.5 20 11 C20.5 9.5 22.5 8 25 8 C29 8 32 11 32 15 C32 19 28 24 20 30Z" fill="white" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-extrabold text-lg tracking-tight">CertiNanas</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#6667AB]">CUIDADO SEGURO</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button className="relative text-[#6667AB] hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#cc8db3] rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</span>
          </button>

          {/* Avatar 1 - brown */}
          <div className="w-8 h-8 rounded-full bg-[#9d85b6] flex items-center justify-center text-white text-sm font-bold">A</div>
          <span className="text-white text-sm font-medium">Admin</span>

          {/* Avatar 2 - orange */}
          <div className="w-8 h-8 rounded-full bg-[#f6a5c0] flex items-center justify-center text-white text-sm font-bold">A</div>

          {/* Profile icon */}
          <button className="text-[#6667AB] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </button>

          {/* Logout */}
          <button onClick={logout} className="text-[#6667AB] hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ======= SIDEBAR ======= */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-[#210635]/90 backdrop-blur-[20px] border-r border-[rgba(255,255,255,0.1)] z-40 overflow-y-auto">
        <nav className="py-4">
          {navItems.map(item => {
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-[#F6A5C0] text-[#210635]'
                    : 'text-[#6667AB] hover:text-white hover:bg-[rgba(33,6,53,0.4)]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#f6a5c0] rounded-r-full" />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#210635]' : 'text-[#6667AB]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ======= MAIN CONTENT ======= */}
      <main className="ml-64 mt-16 p-8 pb-16 min-h-[calc(100vh-4rem)]">
        {tab === 'dashboard' && <DashboardView />}
        {tab === 'contratos' && <ContratosView />}
        {tab === 'postulaciones' && <PostulacionesView />}
        {tab === 'perfiles' && <PerfilesView />}
        {tab === 'incidencias' && <IncidenciasView />}
        {tab === 'mensajes' && <AdminMessages />}
        {tab === 'reportes' && <ReportesView />}
        {tab === 'usuarios' && <UsuariosView />}
      </main>
    </div>
  );
}

function cerrarIncidencia(id: number) {
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };
  fetch(`/api/admin/incidencias/${id}/cerrar`, { method: 'PUT', headers }).then(r => {
    if (r.ok) window.location.reload();
  });
}

/* ======== MENSAJES ADMIN ======== */
function AdminMessages() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(user?.id) };
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [texto, setTexto] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/conversaciones', { headers }).then(r => r.json()).then(data => {
      setConversaciones(data);
      if (data.length > 0) setSelectedChat(data[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    fetch(`/api/mensajes/conversaciones/${selectedChat.Id}/mensajes`, { headers: { 'x-user-id': String(user?.id) } })
      .then(r => r.json()).then(setMensajes).catch(() => {});
  }, [selectedChat?.Id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

  const enviar = async () => {
    if (!texto.trim() || !selectedChat) return;
    const r = await fetch(`/api/admin/conversaciones/${selectedChat.Id}/mensajes`, {
      method: 'POST', headers, body: JSON.stringify({ contenido: texto.trim() }),
    });
    if (r.ok) {
      setMensajes(prev => [...prev, { Id: Date.now(), IdRemitente: Number(user?.id), Contenido: texto.trim(), Leido: 0, FechaEnvio: new Date().toISOString() }]);
      setTexto('');
    }
  };

  const formatHora = (f: string) => {
    const d = new Date(f);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] p-6 gap-6">
      <div className="w-72 flex-shrink-0 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-y-auto">
        <div className="p-4 border-b border-[rgba(255,255,255,0.15)]">
          <h2 className="font-bold text-white">Conversaciones</h2>
          <p className="text-xs text-[#6667AB] mt-0.5">{conversaciones.length} en total</p>
        </div>
        {conversaciones.map(c => (
          <button key={c.Id} onClick={() => setSelectedChat(c)}
            className={`w-full text-left px-4 py-3 border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(33,6,53,0.3)] transition-colors ${selectedChat?.Id === c.Id ? 'bg-[#f6a5c0]/20 backdrop-blur-sm' : ''}`}>
            <p className="text-sm font-semibold text-white truncate">{c.Nombres} {c.Apellidos?.charAt(0)}. ↔ {c.FamiliaNombres} {c.FamiliaApellidos?.charAt(0)}.</p>
            <p className="text-xs text-[#6667AB] truncate mt-0.5">{c.MenorNombre || 'Sin menor'}</p>
            <p className="text-xs text-[#6667AB] mt-0.5">{formatFecha(c.FechaUltimoMensaje || c.FechaCreacion)}</p>
          </button>
        ))}
        {conversaciones.length === 0 && <p className="text-sm text-[#6667AB] text-center py-8">Sin conversaciones</p>}
      </div>

      <div className="flex-1 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-[rgba(255,255,255,0.15)]">
              <h3 className="font-bold text-white">{selectedChat.Nombres} {selectedChat.Apellidos} — {selectedChat.FamiliaNombres} {selectedChat.FamiliaApellidos}</h3>
              <p className="text-xs text-[#6667AB]">{selectedChat.MenorNombre || 'Conversación general'}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mensajes.map(m => {
                const esAdmin = m.IdRemitente === Number(user?.id);
                return (
                  <div key={m.Id} className={`flex ${esAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      esAdmin ? 'bg-[#F6A5C0] text-[#210635] rounded-br-md' : 'bg-[rgba(123,51,126,0.5)] backdrop-blur-sm text-white rounded-bl-md'
                    }`}>
                      <p>{m.Contenido}</p>
                      <p className={`text-xs mt-1 ${esAdmin ? 'text-white/70' : 'text-[#6667AB]'}`}>{formatHora(m.FechaEnvio)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-[rgba(255,255,255,0.15)]">
              <div className="flex gap-2">
                <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === 'Enter' && enviar()}
                  placeholder="Escribir mensaje..." className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]" />
                <button onClick={enviar} className="p-2.5 bg-[#F6A5C0] hover:bg-[#F6A5C0]/80 text-[#210635] rounded-xl transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#6667AB] text-sm">Selecciona una conversación</div>
        )}
      </div>
    </div>
  );
}

/* ======== DASHBOARD ======== */
function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [data, setData] = useState<{ postulacionesRecientes: any[]; incidencias: any[] }>({ postulacionesRecientes: [], incidencias: [] });
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };

  useEffect(() => {
    fetch('/api/admin/stats', { headers }).then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/admin/dashboard', { headers }).then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const kpis = [
    { label: 'Usuarios totales', value: stats?.totalUsers ?? '26', color: 'text-[#f6a5c0]', bg: 'bg-orange-50' },
    { label: 'Cuidadoras activas', value: stats?.totalCuidadoras ?? '10', color: 'text-[#cc8db3]', bg: 'bg-blue-50' },
    { label: 'Servicios completados', value: stats?.serviciosCompletados ?? '61', color: 'text-[#cc8db3]', bg: 'bg-emerald-50' },
    { label: 'Incidencias abiertas', value: stats?.incidenciasAbiertas ?? '5', color: 'text-[#cc8db3]', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(k => (
          <div key={k.label} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 text-center">
            <p className={`text-4xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-sm text-[#6667AB] mt-2 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.15)] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#f6a5c0]" />
          <h2 className="font-bold text-white">Postulaciones recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)]">
                <th className="text-left py-3 px-6 font-semibold text-[#6667AB]">Nombre</th>
                <th className="text-left py-3 px-6 font-semibold text-[#6667AB]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.postulacionesRecientes.length > 0 ? data.postulacionesRecientes.map((p, i) => (
                <tr key={p.Id || i} className={`border-b border-[rgba(255,255,255,0.1)] ${i % 2 === 0 ? 'bg-[rgba(33,6,53,0.3)]' : 'bg-[rgba(33,6,53,0.15)]'} hover:bg-[rgba(33,6,53,0.3)] transition-colors`}>
                  <td className="py-3 px-6 font-semibold text-[#F5D5E0]">{p.Nombres} {p.Apellidos?.charAt(0)}.</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                      p.Estado === 'Aprobada' ? 'bg-[#cc8db3]/20 text-[#cc8db3] border-[#cc8db3]/40' :
                      p.Estado === 'Pendiente' ? 'bg-[#f6a5c0]/20 text-[#f6a5c0] border-[#f6a5c0]/40' :
                      'bg-[#9d85b6]/20 text-[#210635] border-[#9d85b6]/30'
                    }`}>{p.Estado}</span>
                  </td>
                </tr>
              )) : (
                <>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(33,6,53,0.3)] hover:bg-[rgba(33,6,53,0.3)] transition-colors">
                    <td className="py-3 px-6 font-semibold text-[#F5D5E0]">Milagros del Carmen T.</td>
                    <td className="py-3 px-6"><span className="inline-flex px-3 py-1 rounded-full text-xs font-bold border bg-[#f6a5c0]/20 text-[#f6a5c0] border-[#f6a5c0]/40">Pendiente</span></td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(33,6,53,0.15)] hover:bg-[rgba(33,6,53,0.3)] transition-colors">
                    <td className="py-3 px-6 font-semibold text-[#F5D5E0]">Diana Carolina R.</td>
                    <td className="py-3 px-6"><span className="inline-flex px-3 py-1 rounded-full text-xs font-bold border bg-[#cc8db3]/20 text-[#cc8db3] border-[#cc8db3]/40">Aprobada</span></td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(33,6,53,0.3)] hover:bg-[rgba(33,6,53,0.3)] transition-colors">
                    <td className="py-3 px-6 font-semibold text-[#F5D5E0]">Ana Lucía M.</td>
                    <td className="py-3 px-6"><span className="inline-flex px-3 py-1 rounded-full text-xs font-bold border bg-[#9d85b6]/20 text-[#210635] border-[#9d85b6]/30">Rechazada</span></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======== CONTRATOS ======== */
function ContratosView() {
  const [contratos, setContratos] = useState<any[]>([]);
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };

  const cargar = () => {
    fetch('/api/admin/contratos', { headers }).then(r => r.json()).then(setContratos).catch(() => {});
  };

  useEffect(() => { cargar(); }, []);

  const aprobar = async (id: number) => {
    await fetch(`/api/admin/contratos/${id}/aprobar`, { method: 'PUT', headers });
    cargar();
  };

  const rechazar = async (id: number) => {
    await fetch(`/api/admin/contratos/${id}/rechazar`, { method: 'PUT', headers });
    cargar();
  };

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const badgeEstado: Record<string, string> = {
    Pendiente: 'bg-[#f6a5c0]/20 text-[#f6a5c0] border-[#f6a5c0]/40',
    Confirmada: 'bg-[#cc8db3]/20 text-[#cc8db3] border-[#cc8db3]/40',
    'En curso': 'bg-[rgba(33,6,53,0.4)] text-[#cc8db3] border-[rgba(255,255,255,0.15)]',
    Finalizada: 'bg-[rgba(33,6,53,0.4)] text-[#F5D5E0] border-[rgba(255,255,255,0.15)]',
    Cancelada: 'bg-[#9d85b6]/20 text-[#210635] border-[#9d85b6]/30',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Contratos</h1>
      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)]">
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">#</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Familia</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Cuidadora</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Menor</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Servicio</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-[#6667AB]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c, i) => (
                <tr key={c.Id} className={`border-b border-[rgba(255,255,255,0.1)] ${i % 2 === 0 ? 'bg-[rgba(33,6,53,0.3)]' : 'bg-[rgba(33,6,53,0.15)]'} hover:bg-[rgba(33,6,53,0.3)] transition-colors`}>
                  <td className="py-3 px-4 font-mono font-bold text-[#F5D5E0]">CTN-{String(c.Id).padStart(4, '0')}</td>
                  <td className="py-3 px-4 font-semibold text-[#F5D5E0]">{c.FamiliaNombres} {c.FamiliaApellidos?.charAt(0)}.</td>
                  <td className="py-3 px-4 text-[#F5D5E0]">{c.CuidadoraNombres} {c.CuidadoraApellidos?.charAt(0)}.</td>
                  <td className="py-3 px-4 text-[#F5D5E0]">
                    {c.MenorNombre || '—'}
                    {c.MenorDiagnostico && <span className="text-[#6667AB]"> ({c.MenorDiagnostico})</span>}
                  </td>
                  <td className="py-3 px-4 text-[#F5D5E0] text-xs">
                    {formatFecha(c.FechaServicio)} · {c.HoraInicio || '--'}-{c.HoraFin || '--'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#F5D5E0]">S/ {c.Total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${badgeEstado[c.Estado] || 'bg-[rgba(33,6,53,0.4)] text-[#6667AB] border-[rgba(255,255,255,0.2)]'}`}>
                      {c.Estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.Estado === 'Pendiente' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => aprobar(c.Id)}
                          className="px-3 py-1.5 bg-[#cc8db3]/20 text-[#cc8db3] border border-[#cc8db3]/40 rounded-lg text-xs font-bold hover:bg-[#cc8db3]/30 transition-colors">
                          Aprobar
                        </button>
                        <button onClick={() => rechazar(c.Id)}
                          className="px-3 py-1.5 bg-[#f6a5c0]/20 text-[#f6a5c0] border border-[#f6a5c0]/40 rounded-lg text-xs font-bold hover:bg-[#f6a5c0]/30 transition-colors">
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#6667AB]">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {contratos.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-[#6667AB] text-sm">No hay contratos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======== USUARIOS ======== */
function UsuariosView() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };

  useEffect(() => {
    fetch('/api/admin/usuarios', { headers }).then(r => r.json()).then(setUsuarios).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white mb-8">Usuarios</h1>
      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)]">
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Rol</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Activo</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Creado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={u.Id} className={`border-b border-[rgba(255,255,255,0.1)] ${i % 2 === 0 ? 'bg-[rgba(33,6,53,0.3)]' : 'bg-[rgba(33,6,53,0.15)]'} hover:bg-[rgba(33,6,53,0.3)] transition-colors`}>
                  <td className="py-3 px-4 text-[#F5D5E0] font-mono">{u.Id}</td>
                  <td className="py-3 px-4 text-[#F5D5E0] font-medium">{u.Nombres} {u.Apellidos}</td>
                  <td className="py-3 px-4 text-[#F5D5E0]">{u.Email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      u.Rol === 'Admin' ? 'bg-[#f6a5c0]/20 text-[#f6a5c0]' :
                      u.Rol === 'Cuidadora' ? 'bg-[#cc8db3]/20 text-[#cc8db3]' :
                      'bg-[rgba(33,6,53,0.4)] text-[#cc8db3]'
                    }`}>{u.Rol}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block w-2 h-2 rounded-full ${u.Activo ? 'bg-[#cc8db3]' : 'bg-[#cc8db3]'}`} />
                  </td>
                  <td className="py-3 px-4 text-[#6667AB] text-xs">{u.FechaCreacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======== POSTULACIONES ======== */
function PostulacionesView() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(user?.id) };
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [selectedPost, setSelectedPost] = useState<Postulacion | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/postulaciones', { headers }).then(r => r.json()).then(setPostulaciones).catch(() => {});
  }, []);

  const selectPostulacion = (p: Postulacion) => {
    setSelectedPost(p);
    fetch(`/api/admin/postulaciones/${p.Id}/documentos`, { headers })
      .then(r => r.json()).then(setDocumentos).catch(() => {});
  };

  const aprobar = (id: number) => {
    fetch(`/api/admin/postulaciones/${id}/aprobar`, { method: 'POST', headers }).then(r => r.json()).then(() => {
      setPostulaciones(prev => prev.map(p => p.Id === id ? { ...p, Estado: 'Aprobada' } : p));
      setDocumentos(prev => prev.map(d => ({ ...d, Estado: 'Aprobado' })));
    }).catch(() => {});
  };

  const rechazar = (id: number) => {
    fetch(`/api/admin/postulaciones/${id}/rechazar`, { method: 'POST', headers }).then(r => r.json()).then(() => {
      setPostulaciones(prev => prev.map(p => p.Id === id ? { ...p, Estado: 'Rechazada' } : p));
    }).catch(() => {});
  };

  const filtered = postulaciones.filter(p =>
    `${p.Nombres} ${p.Apellidos} ${p.Email}`.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-white">Postulaciones</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6667AB]" />
          <input
            type="text"
            placeholder="Buscar postulante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
          />
        </div>
      </div>

      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)]">
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Postulante</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Documentos</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.Id}
                  className={`border-b border-[rgba(255,255,255,0.1)] transition-colors cursor-pointer ${
                    p.Estado === 'Aprobada' ? 'bg-[#cc8db3]/20' : i % 2 === 0 ? 'bg-[rgba(33,6,53,0.3)]' : 'bg-[rgba(33,6,53,0.15)]'
                  } hover:bg-[rgba(33,6,53,0.3)] ${selectedPost?.Id === p.Id ? 'bg-[#cc8db3]/30 backdrop-blur-sm' : ''}`}
                  onClick={() => selectPostulacion(p)}
                >
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#F5D5E0]">{p.Nombres} {p.Apellidos}</p>
                    <p className="text-xs text-[#6667AB] mt-0.5">{p.Email}</p>
                  </td>
                  <td className="py-3 px-4 text-[#F5D5E0]">{formatDate(p.FechaPostulacion)}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.4)] text-[#cc8db3] text-xs font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      {p.TotalDocumentos} archivos
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      p.Estado === 'Pendiente' ? 'bg-[#f6a5c0]/20 text-[#f6a5c0]' :
                      p.Estado === 'Aprobada' ? 'bg-[#cc8db3]/20 text-[#cc8db3]' :
                      'bg-[#9d85b6]/20 text-[#210635]'
                    }`}>{p.Estado}</span>
                  </td>
                  <td className="py-3 px-4">
                    {p.Estado === 'Pendiente' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); aprobar(p.Id); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#cc8db3]/20 text-[#cc8db3] text-xs font-bold hover:bg-[#cc8db3]/30 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); rechazar(p.Id); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f6a5c0]/20 text-[#f6a5c0] text-xs font-bold hover:bg-[#f6a5c0]/30 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#cc8db3] text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Validada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-[#6667AB]">No hay postulaciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6">
            Documentos de <span className="text-[#f6a5c0]">{selectedPost.Nombres} {selectedPost.Apellidos}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map(doc => (
              <div key={doc.Id} className="border border-[rgba(255,255,255,0.1)] rounded-xl p-4 hover:shadow-lg hover:shadow-black/30 transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(33,6,53,0.4)] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#6667AB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F5D5E0] text-sm">{doc.TipoRequisito}</p>
                    <p className="text-xs text-[#6667AB] mt-1 truncate">{doc.Peso}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                      doc.Estado === 'Pendiente' ? 'bg-[#f6a5c0]/20 text-[#f6a5c0]' :
                      doc.Estado === 'Aprobado' ? 'bg-[#cc8db3]/20 text-[#cc8db3]' :
                      'bg-[#9d85b6]/20 text-[#210635]'
                    }`}>{doc.Estado}</span>
                  </div>
                  <a
                    href={`/uploads/${doc.NombreArchivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[rgba(33,6,53,0.4)] flex items-center justify-center hover:bg-[rgba(33,6,53,0.3)] transition-colors flex-shrink-0"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4 text-[#6667AB]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ======== PERFILES VALIDADOS ======== */
function PerfilesView() {
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };

  useEffect(() => {
    fetch('/api/admin/perfiles-validados', { headers }).then(r => r.json()).then(setPerfiles).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white mb-8">Perfiles Validados</h1>
      <div className="space-y-4">
        {perfiles.map(p => (
          <div key={p.Id} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#cc8db3]/20 flex items-center justify-center text-[#cc8db3] font-bold text-lg">
              {p.Nombres?.charAt(0)}{p.Apellidos?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#F5D5E0]">{p.Nombres} {p.Apellidos}</p>
              <p className="text-sm text-[#6667AB]">{p.Email}</p>
            </div>
            <div className="text-sm text-[#F5D5E0] text-center">
              <p className="font-bold">{p.AniosExperiencia}</p>
              <p className="text-xs text-[#6667AB]">años exp.</p>
            </div>
            <div className="text-sm text-[#F5D5E0] text-center">
              <p className="font-bold">S/ {p.TarifaHora?.toFixed(2)}</p>
              <p className="text-xs text-[#6667AB]">tarifa/hora</p>
            </div>
            <div className="text-sm text-[#F5D5E0] text-center">
              <p className="font-bold text-[#f6a5c0]">{p.CalificacionPromedio}</p>
              <p className="text-xs text-[#6667AB]">({p.TotalResenas} reseñas)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#cc8db3]/20 text-[#cc8db3] text-xs font-bold">Validado</span>
          </div>
        ))}
        {perfiles.length === 0 && <p className="text-center text-[#6667AB] py-12">No hay perfiles validados</p>}
      </div>
    </div>
  );
}

/* ======== INCIDENCIAS ======== */
function IncidenciasView() {
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };

  useEffect(() => {
    fetch('/api/admin/incidencias', { headers }).then(r => r.json()).then(setIncidencias).catch(() => {});
  }, []);

  const badgeTipo = (t: string) => {
    if (t === 'Grave') return 'bg-[rgba(33,6,53,0.4)] text-[#cc8db3] border-[rgba(255,255,255,0.15)]';
    if (t === 'Moderada') return 'bg-[rgba(33,6,53,0.4)] text-[#f6a5c0] border-[rgba(255,255,255,0.15)]';
    return 'bg-[rgba(33,6,53,0.4)] text-[#cc8db3] border-[rgba(255,255,255,0.15)]';
  };
  const badgeEst = (e: string) => {
    if (e === 'Abierta') return 'bg-[#f6a5c0]/20 text-[#f6a5c0] border-[#f6a5c0]/40';
    if (e === 'En revisión') return 'bg-[rgba(33,6,53,0.4)] text-[#cc8db3] border-[rgba(255,255,255,0.15)]';
    return 'bg-[rgba(33,6,53,0.4)] text-[#6667AB] border-[rgba(255,255,255,0.2)]';
  };

  const resolver = (id: number) => {
    fetch(`/api/admin/incidencias/${id}/cerrar`, { method: 'PUT', headers }).then(r => {
      if (r.ok) fetch('/api/admin/incidencias', { headers }).then(r => r.json()).then(setIncidencias);
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white mb-8">Incidencias</h1>
      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)]">
                <th className="text-left py-3 px-6 font-semibold text-[#6667AB]">Servicio</th>
                <th className="text-left py-3 px-6 font-semibold text-[#6667AB]">Tipo</th>
                <th className="text-left py-3 px-6 font-semibold text-[#6667AB]">Estado</th>
                <th className="text-right py-3 px-6 font-semibold text-[#6667AB]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.map((inc, i) => (
                <tr key={inc.Id} className={`border-b border-[rgba(255,255,255,0.1)] ${i % 2 === 0 ? 'bg-[rgba(33,6,53,0.3)]' : 'bg-[rgba(33,6,53,0.15)]'} hover:bg-[rgba(33,6,53,0.3)]`}>
                  <td className="py-3 px-6 font-medium text-[#F5D5E0]">{inc.Servicio}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${badgeTipo(inc.Tipo)}`}>{inc.Tipo}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${badgeEst(inc.Estado)}`}>{inc.Estado}</span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    {inc.Estado !== 'Cerrada' && (
                      <button onClick={() => resolver(inc.Id)}
                        className="text-xs font-semibold text-[#cc8db3] hover:text-[#cc8db3]/80 transition-colors">Resolver</button>
                    )}
                  </td>
                </tr>
              ))}
              {incidencias.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-[#6667AB]">Sin incidencias</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======== REPORTES ======== */
function ReportesView() {
  const [reportes, setReportes] = useState<any>(null);
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };

  useEffect(() => {
    fetch('/api/admin/reportes', { headers }).then(r => r.json()).then(setReportes).catch(() => {});
  }, []);

  const COLORS = ['#837ab6', '#9d85b6', '#cc8db3', '#f6a5c0'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-extrabold text-white">Reportes</h1>
      {reportes && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { label: 'Órdenes', value: reportes.totalOrdenes, color: 'text-[#cc8db3]', icon: TrendingUp },
              { label: 'Completadas', value: reportes.totalCompletadas, color: 'text-[#cc8db3]', icon: CheckCircle },
              { label: 'Canceladas', value: reportes.totalCanceladas, color: 'text-[#cc8db3]', icon: XCircle },
              { label: 'Pagos', value: reportes.totalPagos, color: 'text-purple-600', icon: DollarSign },
              { label: 'Ingresos', value: `S/ ${Number(reportes.ingresos).toFixed(0)}`, color: 'text-[#f6a5c0]', icon: TrendingUp },
              { label: 'Citas', value: reportes.citasCompletadas, color: 'text-teal-600', icon: CheckCircle },
              { label: 'Reseñas', value: reportes.resenasPromedio, color: 'text-orange-600', icon: BarChart3 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(33,6,53,0.4)] flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-[#6667AB]">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Órdenes por Estado</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reportes.ordenesPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="Estado" tick={{ fontSize: 12, fill: '#6667AB' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6667AB' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(33,6,53,0.65)', backdropFilter: 'blur(20px)', color: '#F5D5E0' }} />
                  <Bar dataKey="count" name="Cantidad" radius={[6, 6, 0, 0]}>
                    {reportes.ordenesPorEstado.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Distribución de Pagos</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={reportes.pagosPorEstado}
                    dataKey="count"
                    nameKey="Estado"
                    cx="50%" cy="50%" outerRadius={100}
                    label={({ Estado, count }) => `${Estado} (${count})`}
                    fill="#F5D5E0"
                  >
                    {reportes.pagosPorEstado.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(33,6,53,0.65)', backdropFilter: 'blur(20px)', color: '#F5D5E0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Órdenes por Mes</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={reportes.ordenesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6667AB' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6667AB' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(33,6,53,0.65)', backdropFilter: 'blur(20px)', color: '#F5D5E0' }} />
                  <Line type="monotone" dataKey="count" name="Órdenes" stroke="#cc8db3" strokeWidth={2} dot={{ fill: '#cc8db3', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Ingresos por Mes</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reportes.ingresosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6667AB' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6667AB' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(33,6,53,0.65)', backdropFilter: 'blur(20px)', color: '#F5D5E0' }} formatter={(v: number) => [`S/ ${v.toFixed(2)}`, 'Ingresos']} />
                  <Bar dataKey="total" name="Ingresos" radius={[6, 6, 0, 0]} fill="#cc8db3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Top 5 Cuidadoras con más servicios</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reportes.topCuidadoras} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6667AB' }} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 12, fill: '#6667AB' }} width={160} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(33,6,53,0.65)', backdropFilter: 'blur(20px)', color: '#F5D5E0' }} />
                <Bar dataKey="total" name="Servicios" radius={[0, 6, 6, 0]} fill="#9d85b6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
