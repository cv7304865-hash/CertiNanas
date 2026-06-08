import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, FileText, UserCheck, AlertTriangle, Users, BarChart3, LogOut, ChevronLeft, CheckCircle, XCircle, Eye, Search, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Postulacion = {
  Id: number; IdUsuario: number; FechaPostulacion: string; Estado: string;
  Nombres: string; Apellidos: string; Email: string; TotalDocumentos: number;
};

type Documento = {
  Id: number; IdPostulacion: number; TipoRequisito: string;
  NombreArchivo: string; Peso: string; Estado: string;
};

type Tab = 'dashboard' | 'postulaciones' | 'perfiles' | 'incidencias' | 'usuarios' | 'reportes';

const navItems: { key: Tab; label: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
            <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-xs font-bold text-[#F59E0B]">
              {user?.nombres?.charAt(0) || 'A'}
            </div>
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
        {tab === 'postulaciones' && <PostulacionesView />}
        {tab === 'usuarios' && <UsuariosView />}
        {(tab === 'perfiles' || tab === 'incidencias' || tab === 'reportes') && (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            Módulo en desarrollo
          </div>
        )}
      </main>
    </div>
  );
}

/* ======== DASHBOARD ======== */
function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [exitos, setExitos] = useState<any[]>([]);
  const [noAcuerdo, setNoAcuerdo] = useState<any[]>([]);
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(useAuth().user?.id) };

  useEffect(() => {
    fetch('/api/admin/stats', { headers }).then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/admin/exito', { headers }).then(r => r.json()).then(setExitos).catch(() => {});
    fetch('/api/admin/no-acuerdo', { headers }).then(r => r.json()).then(setNoAcuerdo).catch(() => {});
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Usuarios', value: stats.totalUsers, color: 'blue' },
            { label: 'Familias', value: stats.totalFamilias, color: 'emerald' },
            { label: 'Cuidadoras', value: stats.totalCuidadoras, color: 'purple' },
            { label: 'Admins', value: stats.totalAdmins, color: 'amber' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Casos de Éxito
          </h2>
          <div className="space-y-3">
            {exitos.slice(0, 4).map(c => (
              <div key={c.Id} className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-800">{c.Titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">{c.Descripcion}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" /> Casos sin Acuerdo
          </h2>
          <div className="space-y-3">
            {noAcuerdo.slice(0, 4).map(c => (
              <div key={c.Id} className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-800">{c.Titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">{c.Descripcion}</p>
              </div>
            ))}
          </div>
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
                    <p className="text-xs text-gray-400 mt-1 truncate">{doc.NombreArchivo} - {doc.Peso}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                      doc.Estado === 'Pendiente' ? 'bg-orange-50 text-orange-700' :
                      doc.Estado === 'Aprobado' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-red-50 text-red-700'
                    }`}>{doc.Estado}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
