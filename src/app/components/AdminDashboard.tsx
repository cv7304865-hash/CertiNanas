import { motion } from 'motion/react';
import { Shield, Users, UserCheck, UserCog, LogOut, ArrowLeft, Heart, XCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

type AdminStats = {
  totalUsers: number;
  totalCuidadoras: number;
  totalFamilias: number;
  totalAdmins: number;
};

type Usuario = {
  Id: number;
  Email: string;
  Nombres: string;
  Apellidos: string;
  Rol: string;
  Activo: number;
  FechaCreacion: string;
};

type Caso = {
  Id: number;
  Titulo: string;
  Descripcion: string;
  IdFamilia: number;
  IdCuidadora: number;
  FechaCreacion: string;
};

type Props = {
  onBack: () => void;
};

export function AdminDashboard({ onBack }: Props) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [exitos, setExitos] = useState<Caso[]>([]);
  const [noAcuerdo, setNoAcuerdo] = useState<Caso[]>([]);
  const [tab, setTab] = useState<'stats' | 'usuarios' | 'exito' | 'noacuerdo'>('stats');

  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(user?.id) };
    fetch('/api/admin/stats', { headers }).then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/admin/usuarios', { headers }).then(r => r.json()).then(setUsuarios).catch(() => {});
    fetch('/api/admin/exito', { headers }).then(r => r.json()).then(setExitos).catch(() => {});
    fetch('/api/admin/no-acuerdo', { headers }).then(r => r.json()).then(setNoAcuerdo).catch(() => {});
  }, [user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 text-[#250e2c]/50 hover:text-[#250e2c] hover:bg-[#f6a5c0]/20 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#250e2c]" />
                <h1 className="text-3xl font-bold text-[#250e2c]">Panel Admin</h1>
              </div>
              <p className="text-[#250e2c]/60 mt-1">Bienvenido, {user?.nombres} — aquí puedes supervisar toda la plataforma.</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-[#250e2c]/50 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Cerrar sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-8 flex-wrap">
        <button onClick={() => setTab('stats')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'stats' ? 'bg-[#250e2c] text-white shadow-lg' : 'bg-white/20 text-[#250e2c]/70 hover:bg-white/30'}`}>
          Estadísticas
        </button>
        <button onClick={() => setTab('usuarios')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'usuarios' ? 'bg-[#250e2c] text-white shadow-lg' : 'bg-white/20 text-[#250e2c]/70 hover:bg-white/30'}`}>
          Usuarios
        </button>
        <button onClick={() => setTab('exito')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'exito' ? 'bg-[#250e2c] text-white shadow-lg' : 'bg-white/20 text-[#250e2c]/70 hover:bg-white/30'}`}>
          <Heart className="w-4 h-4 inline mr-1.5 -mt-0.5" />Casos de Éxito
        </button>
        <button onClick={() => setTab('noacuerdo')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'noacuerdo' ? 'bg-[#250e2c] text-white shadow-lg' : 'bg-white/20 text-[#250e2c]/70 hover:bg-white/30'}`}>
          <XCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />Sin Acuerdo
        </button>
      </div>

      {tab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Usuarios', value: stats.totalUsers, icon: Users, color: 'blue' },
            { label: 'Familias', value: stats.totalFamilias, icon: UserCheck, color: 'emerald' },
            { label: 'Cuidadoras', value: stats.totalCuidadoras, icon: UserCog, color: 'purple' },
            { label: 'Admins', value: stats.totalAdmins, icon: Shield, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} whileHover={{ scale: 1.02 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6 border border-white/20 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                color === 'blue' ? 'bg-[#f6a5c0]/20 text-[#250e2c]' :
                color === 'emerald' ? 'bg-[#f6a5c0]/20 text-[#cc8db3]' :
                color === 'purple' ? 'bg-[#9d85b6]/20 text-[#250e2c]' :
                'bg-[#f6a5c0]/20 text-[#cc8db3]'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-[#250e2c]">{value}</p>
              <p className="text-sm text-[#250e2c]/60 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'exito' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-[#cc8db3]" />
            <h2 className="text-xl font-bold text-[#250e2c]">Historias de Éxito</h2>
            <span className="text-sm text-[#250e2c]/50 ml-2">({exitos.length} casos)</span>
          </div>
          {exitos.map(c => (
            <motion.div key={c.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6 border border-white/20 shadow-sm">
              <h3 className="font-bold text-[#250e2c] text-lg">{c.Titulo}</h3>
              <p className="text-[#250e2c]/70 mt-2 leading-relaxed">{c.Descripcion}</p>
              <p className="text-xs text-[#250e2c]/50 mt-3">{c.FechaCreacion}</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'noacuerdo' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-[#250e2c]">Casos sin Acuerdo</h2>
            <span className="text-sm text-[#250e2c]/50 ml-2">({noAcuerdo.length} casos)</span>
          </div>
          {noAcuerdo.map(c => (
            <motion.div key={c.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6 border border-white/20 shadow-sm">
              <h3 className="font-bold text-[#250e2c] text-lg">{c.Titulo}</h3>
              <p className="text-[#250e2c]/70 mt-2 leading-relaxed">{c.Descripcion}</p>
              <p className="text-xs text-[#250e2c]/50 mt-3">{c.FechaCreacion}</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'usuarios' && (
        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl border border-white/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/10 border-b border-white/20">
                  <th className="text-left py-3 px-4 font-semibold text-[#250e2c]/70">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#250e2c]/70">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#250e2c]/70">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#250e2c]/70">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#250e2c]/70">Activo</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#250e2c]/70">Creado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.Id} className="border-b border-gray-50 hover:bg-white/10 transition-colors">
                    <td className="py-3 px-4 text-[#250e2c] font-mono">{u.Id}</td>
                    <td className="py-3 px-4 text-[#250e2c] font-medium">{u.Nombres} {u.Apellidos}</td>
                    <td className="py-3 px-4 text-[#250e2c]/70">{u.Email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        u.Rol === 'Admin' ? 'bg-[#f6a5c0]/20 text-[#cc8db3]' :
                        u.Rol === 'Cuidadora' ? 'bg-[#f6a5c0]/20 text-[#cc8db3]' :
                        'bg-[#f6a5c0]/20 text-[#cc8db3]'
                      }`}>{u.Rol}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block w-2 h-2 rounded-full ${u.Activo ? 'bg-green-500' : 'bg-red-400'}`} />
                    </td>
                    <td className="py-3 px-4 text-[#250e2c]/50 text-xs">{u.FechaCreacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


