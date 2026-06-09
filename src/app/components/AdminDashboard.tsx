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
    fetch('/api/admin/casos?tipo=Exito', { headers }).then(r => r.json()).then(setExitos).catch(() => {});
    fetch('/api/admin/casos?tipo=NoAcuerdo', { headers }).then(r => r.json()).then(setNoAcuerdo).catch(() => {});
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 text-[#6667AB] hover:text-white hover:bg-[rgba(246,165,192,0.2)] rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-white" />
                  <h1 className="text-3xl font-bold text-white">Panel Admin</h1>
                </div>
                <p className="text-[#6667AB] mt-1">Bienvenido, {user?.nombres} — aquí puedes supervisar toda la plataforma.</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-[#6667AB] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-8 flex-wrap">
          <button onClick={() => setTab('stats')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'stats' ? 'bg-[#F6A5C0] text-[#210635] shadow-lg' : 'bg-[rgba(33,6,53,0.4)] text-[#6667AB] hover:bg-[rgba(33,6,53,0.5)]'}`}>
            Estadísticas
          </button>
          <button onClick={() => setTab('usuarios')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'usuarios' ? 'bg-[#F6A5C0] text-[#210635] shadow-lg' : 'bg-[rgba(33,6,53,0.4)] text-[#6667AB] hover:bg-[rgba(33,6,53,0.5)]'}`}>
            Usuarios
          </button>
          <button onClick={() => setTab('exito')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'exito' ? 'bg-[#F6A5C0] text-[#210635] shadow-lg' : 'bg-[rgba(33,6,53,0.4)] text-[#6667AB] hover:bg-[rgba(33,6,53,0.5)]'}`}>
            <Heart className="w-4 h-4 inline mr-1.5 -mt-0.5" />Casos de Éxito
          </button>
          <button onClick={() => setTab('noacuerdo')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'noacuerdo' ? 'bg-[#F6A5C0] text-[#210635] shadow-lg' : 'bg-[rgba(33,6,53,0.4)] text-[#6667AB] hover:bg-[rgba(33,6,53,0.5)]'}`}>
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
              <motion.div key={label} whileHover={{ scale: 1.02 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                color === 'blue' ? 'bg-[#f6a5c0]/20 text-white' :
                color === 'emerald' ? 'bg-[#f6a5c0]/20 text-[#F5D5E0]' :
                color === 'purple' ? 'bg-[#9d85b6]/20 text-white' :
                'bg-[#f6a5c0]/20 text-[#F5D5E0]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-[#6667AB] mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'exito' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-[#cc8db3]" />
              <h2 className="text-xl font-bold text-white">Historias de Éxito</h2>
              <span className="text-sm text-[#6667AB] ml-2">({exitos.length} casos)</span>
            </div>
            {exitos.map(c => (
              <motion.div key={c.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
                <h3 className="font-bold text-white text-lg">{c.Titulo}</h3>
                <p className="text-[#6667AB] mt-2 leading-relaxed">{c.Descripcion}</p>
                <p className="text-xs text-[#6667AB] mt-3">{c.FechaCreacion}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'noacuerdo' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Casos sin Acuerdo</h2>
              <span className="text-sm text-[#6667AB] ml-2">({noAcuerdo.length} casos)</span>
            </div>
            {noAcuerdo.map(c => (
              <motion.div key={c.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
                <h3 className="font-bold text-white text-lg">{c.Titulo}</h3>
                <p className="text-[#6667AB] mt-2 leading-relaxed">{c.Descripcion}</p>
                <p className="text-xs text-[#6667AB] mt-3">{c.FechaCreacion}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'usuarios' && (
          <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[rgba(33,6,53,0.4)] border-b border-[rgba(255,255,255,0.1)]">
                    <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Nombre</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Rol</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Activo</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.Id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(33,6,53,0.3)] transition-colors">
                      <td className="py-3 px-4 text-white font-mono">{u.Id}</td>
                      <td className="py-3 px-4 text-white font-medium">{u.Nombres} {u.Apellidos}</td>
                      <td className="py-3 px-4 text-[#6667AB]">{u.Email}</td>
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
                      <td className="py-3 px-4 text-[#6667AB] text-xs">{u.FechaCreacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
