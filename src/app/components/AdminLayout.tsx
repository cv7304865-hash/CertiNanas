import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, FileText, UserCheck, AlertTriangle, Users, BarChart3, LogOut, ChevronLeft, CheckCircle, XCircle, Eye, Search, ArrowUpDown, FileSignature, TrendingUp, DollarSign, PieChart as PieIcon, Download } from 'lucide-react';
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

type Tab = 'dashboard' | 'postulaciones' | 'perfiles' | 'incidencias' | 'usuarios' | 'reportes' | 'contratos';

const navItems: { key: Tab; label: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'contratos', label: 'Contratos', icon: FileSignature },
  { key: 'postulaciones', label: 'Postulaciones', icon: FileText },
  { key: 'perfiles', label: 'Perfiles Validados', icon: UserCheck },
  { key: 'incidencias', label: 'Incidencias', icon: AlertTriangle },
  { key: 'usuarios', label: 'Usuarios', icon: Users },
  { key: 'reportes', label: 'Reportes', icon: BarChart3 },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Admin</h1>
              <p className="text-xs text-white/50">Panel de control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-l-2 border-[#F59E0B]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'text-[#F59E0B]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <ProfileAvatar size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombres} {user?.apellidos}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Cerrar sesión">
              <LogOut className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && <DashboardView />}
        {tab === 'contratos' && <ContratosView />}
        {tab === 'postulaciones' && <PostulacionesView />}
        {tab === 'perfiles' && <PerfilesView />}
        {tab === 'incidencias' && <IncidenciasView />}
        {tab === 'reportes' && <ReportesView />}
        {tab === 'usuarios' && <UsuariosView />}
      </main>
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
    { label: 'Usuarios totales', value: stats?.totalUsers ?? '—', color: 'text-amber-500' },
    { label: 'Cuidadoras activas', value: stats?.totalCuidadoras ?? '—', color: 'text-blue-500' },
    { label: 'Servicios completados', value: stats?.serviciosCompletados ?? '—', color: 'text-emerald-500' },
    { label: 'Incidencias abiertas', value: stats?.incidenciasAbiertas ?? '—', color: 'text-red-500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className={`text-4xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-sm text-gray-500 mt-2">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Postulaciones recientes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="font-bold text-gray-900">Postulaciones recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-6 font-semibold text-gray-600">Nombre</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.postulacionesRecientes.map(p => (
                <tr key={p.Id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 font-semibold text-gray-900">{p.Nombres} {p.Apellidos?.charAt(0)}.</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                      p.Estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>{p.Estado}</span>
                  </td>
                </tr>
              ))}
              {data.postulacionesRecientes.length === 0 && (
                <tr><td colSpan={2} className="py-8 text-center text-gray-400 text-sm">No hay postulaciones recientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incidencias abiertas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-gray-900">Incidencias abiertas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-6 font-semibold text-gray-600">Servicio</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-600">Tipo</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.incidencias.map((inc, i) => (
                <tr key={inc.IdCita} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 font-bold text-gray-900 font-mono">#SOL-{String(inc.IdCita).padStart(3, '0')}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                      i === 0 ? 'bg-red-50 text-red-700 border-red-200' : i === 1 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {i === 0 ? 'Grave' : i === 1 ? 'Moderada' : 'Leve'}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                      i < 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {i < 2 ? 'Abierta' : 'En revisión'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.incidencias.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">No hay incidencias abiertas</td></tr>
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
    Pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    Confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En curso': 'bg-blue-50 text-blue-700 border-blue-200',
    Finalizada: 'bg-teal-50 text-teal-700 border-teal-200',
    Cancelada: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Familia</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Cuidadora</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Menor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Servicio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map(c => (
                <tr key={c.Id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">CTN-{String(c.Id).padStart(4, '0')}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{c.FamiliaNombres} {c.FamiliaApellidos?.charAt(0)}.</td>
                  <td className="py-3 px-4 text-gray-700">{c.CuidadoraNombres} {c.CuidadoraApellidos?.charAt(0)}.</td>
                  <td className="py-3 px-4 text-gray-600">
                    {c.MenorNombre || '—'}
                    {c.MenorDiagnostico && <span className="text-gray-400"> ({c.MenorDiagnostico})</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {formatFecha(c.FechaServicio)} · {c.HoraInicio || '--'}-{c.HoraFin || '--'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">S/ {c.Total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${badgeEstado[c.Estado] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {c.Estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.Estado === 'Pendiente' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => aprobar(c.Id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                          Aprobar
                        </button>
                        <button onClick={() => rechazar(c.Id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {contratos.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No hay contratos registrados</td></tr>
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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Usuarios</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Rol</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Activo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Creado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.Id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-800 font-mono">{u.Id}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{u.Nombres} {u.Apellidos}</td>
                  <td className="py-3 px-4 text-gray-600">{u.Email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      u.Rol === 'Admin' ? 'bg-amber-50 text-amber-700' :
                      u.Rol === 'Cuidadora' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>{u.Rol}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block w-2 h-2 rounded-full ${u.Activo ? 'bg-green-500' : 'bg-red-400'}`} />
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{u.FechaCreacion}</td>
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Postulaciones</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar postulante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
          />
        </div>
      </div>

      {/* Tabla de Postulaciones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Postulante</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Documentos</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.Id}
                  className={`border-b border-gray-50 transition-colors cursor-pointer ${
                    p.Estado === 'Aprobada' ? 'bg-emerald-50/40' : 'hover:bg-gray-50'
                  } ${selectedPost?.Id === p.Id ? 'bg-blue-50/60' : ''}`}
                  onClick={() => selectPostulacion(p)}
                >
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">{p.Nombres} {p.Apellidos}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.Email}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(p.FechaPostulacion)}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      {p.TotalDocumentos} archivos
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      p.Estado === 'Pendiente' ? 'bg-orange-50 text-orange-700' :
                      p.Estado === 'Aprobada' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-red-50 text-red-700'
                    }`}>{p.Estado}</span>
                  </td>
                  <td className="py-3 px-4">
                    {p.Estado === 'Pendiente' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); aprobar(p.Id); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); rechazar(p.Id); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Validada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No hay postulaciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle de Documentos */}
      {selectedPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Documentos de <span className="text-[#F59E0B]">{selectedPost.Nombres} {selectedPost.Apellidos}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map(doc => (
              <div key={doc.Id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{doc.TipoRequisito}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{doc.Peso}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                      doc.Estado === 'Pendiente' ? 'bg-orange-50 text-orange-700' :
                      doc.Estado === 'Aprobado' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-red-50 text-red-700'
                    }`}>{doc.Estado}</span>
                  </div>
                  <a
                    href={`/uploads/${doc.NombreArchivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Perfiles Validados</h1>
      <div className="space-y-4">
        {perfiles.map(p => (
          <div key={p.Id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-lg">
              {p.Nombres?.charAt(0)}{p.Apellidos?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{p.Nombres} {p.Apellidos}</p>
              <p className="text-sm text-gray-500">{p.Email}</p>
            </div>
            <div className="text-sm text-gray-600 text-center">
              <p className="font-bold">{p.AniosExperiencia}</p>
              <p className="text-xs text-gray-400">años exp.</p>
            </div>
            <div className="text-sm text-gray-600 text-center">
              <p className="font-bold">S/ {p.TarifaHora?.toFixed(2)}</p>
              <p className="text-xs text-gray-400">tarifa/hora</p>
            </div>
            <div className="text-sm text-gray-600 text-center">
              <p className="font-bold text-amber-600">{p.CalificacionPromedio}</p>
              <p className="text-xs text-gray-400">({p.TotalResenas} reseñas)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">Validado</span>
          </div>
        ))}
        {perfiles.length === 0 && <p className="text-center text-gray-400 py-12">No hay perfiles validados</p>}
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Incidencias</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.map((inc, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">{inc.Tipo}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{inc.Usuario}</td>
                  <td className="py-3 px-4 text-gray-500">{inc.Fecha}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">{inc.Estado}</span>
                  </td>
                </tr>
              ))}
              {incidencias.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-gray-400">Sin incidencias</td></tr>}
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

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
      {reportes && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { label: 'Órdenes', value: reportes.totalOrdenes, color: 'text-blue-600', icon: TrendingUp },
              { label: 'Completadas', value: reportes.totalCompletadas, color: 'text-emerald-600', icon: CheckCircle },
              { label: 'Canceladas', value: reportes.totalCanceladas, color: 'text-red-600', icon: XCircle },
              { label: 'Pagos', value: reportes.totalPagos, color: 'text-purple-600', icon: DollarSign },
              { label: 'Ingresos', value: `S/ ${Number(reportes.ingresos).toFixed(0)}`, color: 'text-amber-600', icon: TrendingUp },
              { label: 'Citas', value: reportes.citasCompletadas, color: 'text-teal-600', icon: CheckCircle },
              { label: 'Reseñas', value: reportes.resenasPromedio, color: 'text-orange-600', icon: BarChart3 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '100')}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gráficos: 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Órdenes por Estado - Barras */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Órdenes por Estado</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reportes.ordenesPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="Estado" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="count" name="Cantidad" radius={[6, 6, 0, 0]}>
                    {reportes.ordenesPorEstado.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribución de Pagos - Pastel */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Distribución de Pagos</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={reportes.pagosPorEstado}
                    dataKey="count"
                    nameKey="Estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ Estado, count }) => `${Estado} (${count})`}
                  >
                    {reportes.pagosPorEstado.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Órdenes por Mes - Líneas */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Órdenes por Mes</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={reportes.ordenesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                  <Line type="monotone" dataKey="count" name="Órdenes" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Ingresos por Mes - Barras */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Ingresos por Mes</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reportes.ingresosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} formatter={(v: number) => [`S/ ${v.toFixed(2)}`, 'Ingresos']} />
                  <Bar dataKey="total" name="Ingresos" radius={[6, 6, 0, 0]} fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Cuidadoras - Barras horizontales */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Top 5 Cuidadoras con más servicios</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reportes.topCuidadoras} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 12 }} width={160} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="total" name="Servicios" radius={[0, 6, 6, 0]} fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
