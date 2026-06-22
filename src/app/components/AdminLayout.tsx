import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, MessageSquare, Shield, Handshake, BarChart3,
  Clock, AlertTriangle, Bell, LogOut, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminPostulaciones } from './AdminPostulaciones';
import { AdminNegociaciones } from './AdminNegociaciones';
import { AdminPagosProtegidos } from './AdminPagosProtegidos';
import { AdminMediaciones } from './AdminMediaciones';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSLAMonitor } from './AdminSLAMonitor';
import { AdminAlertasRiesgo } from './AdminAlertasRiesgo';
import { AdminIncidencias } from './AdminIncidencias';

type Tab = 'dashboard' | 'postulaciones' | 'negociaciones' | 'pagos' | 'mediaciones' | 'analitica' | 'sla' | 'alertas' | 'incidencias';

const navItems: { key: Tab; label: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'postulaciones', label: 'Postulaciones', icon: FileText },
  { key: 'negociaciones', label: 'Negociaciones', icon: MessageSquare },
  { key: 'pagos', label: 'Pagos Protegidos', icon: Shield },
  { key: 'mediaciones', label: 'Mediaciones', icon: Handshake },
  { key: 'analitica', label: 'Analítica', icon: BarChart3 },
  { key: 'sla', label: 'Monitoreo SLA', icon: Clock },
  { key: 'alertas', label: 'Alertas de Riesgo', icon: AlertTriangle },
  { key: 'incidencias', label: 'Incidencias', icon: AlertCircle },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E] font-['Inter',system-ui,sans-serif]">
      <div className="flex h-screen overflow-hidden">
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 bg-[rgba(33,6,53,0.9)] backdrop-blur-[20px] border-r border-[rgba(255,255,255,0.1)] flex flex-col transition-all duration-300 z-30`}>
          <div className="flex items-center justify-between px-4 h-16 border-b border-[rgba(255,255,255,0.1)]">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0">
                  <circle cx="20" cy="20" r="20" fill="#cc8db3" />
                  <path d="M20 30 C12 24 8 19 8 15 C8 11 11 8 15 8 C17.5 8 19.5 9.5 20 11 C20.5 9.5 22.5 8 25 8 C29 8 32 11 32 15 C32 19 28 24 20 30Z" fill="white" />
                </svg>
                <span className="text-white font-extrabold text-sm tracking-tight">CERTINANAS Admin</span>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="mx-auto">
                <svg viewBox="0 0 40 40" className="w-8 h-8">
                  <circle cx="20" cy="20" r="20" fill="#cc8db3" />
                  <path d="M20 30 C12 24 8 19 8 15 C8 11 11 8 15 8 C17.5 8 19.5 9.5 20 11 C20.5 9.5 22.5 8 25 8 C29 8 32 11 32 15 C32 19 28 24 20 30Z" fill="white" />
                </svg>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-[#6667AB] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map(item => {
              const isActive = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-[#F6A5C0] text-[#210635]'
                      : 'text-[#6667AB] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#f6a5c0] rounded-r-full" />
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#210635]' : ''}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#F6A5C0] flex items-center justify-center text-[#210635] text-sm font-bold">
                  {user?.nombres?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{user?.nombres} {user?.apellidos}</p>
                  <p className="text-[10px] text-[#6667AB] truncate">Administrador</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-[#6667AB] hover:text-red-400 hover:bg-red-500/10 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-[rgba(33,6,53,0.8)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between px-6 flex-shrink-0">
            <h1 className="text-lg font-extrabold text-white">Panel de Administración</h1>
            <div className="flex items-center gap-4">
              <button className="relative text-[#6667AB] hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F6A5C0] rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#F6A5C0] flex items-center justify-center text-[#210635] text-sm font-bold">
                {user?.nombres?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'dashboard' && <AdminDashboard />}
                {tab === 'postulaciones' && <AdminPostulaciones />}
                {tab === 'negociaciones' && <AdminNegociaciones />}
                {tab === 'pagos' && <AdminPagosProtegidos />}
                {tab === 'mediaciones' && <AdminMediaciones />}
                {tab === 'analitica' && <AdminAnalytics />}
                {tab === 'sla' && <AdminSLAMonitor />}
                {tab === 'alertas' && <AdminAlertasRiesgo />}
                {tab === 'incidencias' && <AdminIncidencias />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
