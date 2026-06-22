import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';
import { Shield, User, Calendar, Lock, Eye, EyeOff } from 'lucide-react';

type RegistroSalud = {
  id: number; idMenor: number; idOrden: number;
  datosSalud: any; fechaCreacion: string;
};

type MenorInfo = { id: number; nombre: string; diagnostico: string | null };

export function HistorialSalud({ ordenId, readOnly }: { ordenId?: number; readOnly?: boolean }) {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [menores, setMenores] = useState<MenorInfo[]>([]);
  const [selectedMenor, setSelectedMenor] = useState<number | null>(null);
  const [registros, setRegistros] = useState<RegistroSalud[]>([]);
  const [loading, setLoading] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  interface FormData {
    presionArterial: string;
    frecuenciaCardiaca: string;
    temperatura: string;
    sintomas: string;
    medicacion: string;
    observaciones: string;
    nivelEnergia: string;
  }
  const [formData, setFormData] = useState<FormData>({
    presionArterial: '',
    frecuenciaCardiaca: '',
    temperatura: '',
    sintomas: '',
    medicacion: '',
    observaciones: '',
    nivelEnergia: 'Normal',
  });
  const [showCifrado, setShowCifrado] = useState(false);

  useEffect(() => {
    if (!ordenId) return;
    fetch(`/api/salud/orden/${ordenId}`, { headers })
      .then(r => r.json())
      .then(data => {
        setMenores(data.menores || []);
        if (data.menores?.length === 1) setSelectedMenor(data.menores[0].id);
      })
      .catch(() => {});
  }, [ordenId]);

  useEffect(() => {
    if (!selectedMenor) return;
    setLoading(true);
    fetch(`/api/salud/menor/${selectedMenor}`, { headers })
      .then(r => r.json())
      .then(data => setRegistros(data.registros || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedMenor]);

  const handleRegistrar = async () => {
    if (!selectedMenor || !ordenId) return;
    setRegistrando(true);
    setMessage(null);
    try {
      const r = await fetch('/api/salud/registrar', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          IdMenor: selectedMenor,
          IdOrden: ordenId,
          datosSalud: formData,
        }),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Registro de salud guardado de forma segura (cifrado AES-256-GCM)' });
        setFormData({
          presionArterial: '', frecuenciaCardiaca: '', temperatura: '',
          sintomas: '', medicacion: '', observaciones: '', nivelEnergia: 'Normal',
        });
        const reload = await fetch(`/api/salud/menor/${selectedMenor}`, { headers }).then(r => r.json());
        setRegistros(reload.registros || []);
      } else {
        const data = await r.json();
        setMessage({ type: 'danger', text: data.error || 'Error al guardar' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
    setRegistrando(false);
  };

  if (!ordenId) {
    return (
      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 text-center">
        <Shield className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
        <p className="text-[#6667AB] text-sm">Selecciona un servicio activo para ver el historial de salud</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#F6A5C0]" />
        <h3 className="text-lg font-bold text-white">Historial de Salud</h3>
        {showCifrado ? (
          <button onClick={() => setShowCifrado(false)} className="ml-auto text-[10px] text-[#6EE7B7] flex items-center gap-1">
            <Lock className="w-3 h-3" /> Cifrado AES-256-GCM
          </button>
        ) : (
          <button onClick={() => setShowCifrado(true)} className="ml-auto text-[10px] text-[#6667AB] flex items-center gap-1">
            <EyeOff className="w-3 h-3" /> Seguridad
          </button>
        )}
      </div>

      {showCifrado && (
        <div className="mb-4 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl p-3">
          <p className="text-xs text-[#6EE7B7]">
            <Lock className="w-3 h-3 inline mr-1" />
            Todos los datos de salud se cifran con AES-256-GCM antes de almacenarse. Solo tú y la cuidadora con servicio activo pueden acceder.
          </p>
        </div>
      )}

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      {menores.length > 1 && (
        <div className="mb-4">
          <label className="text-xs font-bold text-[#F5D5E0]/70 block mb-2">Seleccionar menor</label>
          <select value={selectedMenor ?? ''} onChange={e => setSelectedMenor(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
          >
            <option value="">Seleccionar...</option>
            {menores.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
      )}

      {selectedMenor && !readOnly && (
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 mb-6">
          <h4 className="text-sm font-bold text-white mb-4">Nuevo registro de salud</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-[#6667AB] block mb-1">Presión arterial</label>
              <input value={formData.presionArterial} onChange={e => setFormData(f => ({ ...f, presionArterial: e.target.value }))}
                placeholder="120/80" className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#6667AB] block mb-1">Frecuencia cardíaca</label>
              <input value={formData.frecuenciaCardiaca} onChange={e => setFormData(f => ({ ...f, frecuenciaCardiaca: e.target.value }))}
                placeholder="80 lpm" className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#6667AB] block mb-1">Temperatura</label>
              <input value={formData.temperatura} onChange={e => setFormData(f => ({ ...f, temperatura: e.target.value }))}
                placeholder="36.5 °C" className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#6667AB] block mb-1">Nivel de energía</label>
              <select value={formData.nivelEnergia} onChange={e => setFormData(f => ({ ...f, nivelEnergia: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs"
              >
                <option value="Bajo">Bajo</option>
                <option value="Normal">Normal</option>
                <option value="Alto">Alto</option>
                <option value="Muy Alto">Muy Alto</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="text-[10px] text-[#6667AB] block mb-1">Síntomas</label>
            <textarea value={formData.sintomas} onChange={e => setFormData(f => ({ ...f, sintomas: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs resize-none"
              placeholder="Describe síntomas observados..." />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-[#6667AB] block mb-1">Medicación administrada</label>
              <textarea value={formData.medicacion} onChange={e => setFormData(f => ({ ...f, medicacion: e.target.value }))} rows={2}
                className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs resize-none"
                placeholder="Medicamento, dosis, hora..." />
            </div>
            <div>
              <label className="text-[10px] text-[#6667AB] block mb-1">Observaciones</label>
              <textarea value={formData.observaciones} onChange={e => setFormData(f => ({ ...f, observaciones: e.target.value }))} rows={2}
                className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs resize-none"
                placeholder="Notas adicionales..." />
            </div>
          </div>
          <button onClick={handleRegistrar} disabled={registrando || !formData.sintomas}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
          >
            {registrando ? 'Cifrando y guardando...' : 'Guardar registro de salud (cifrado)'}
          </button>
        </div>
      )}

      {selectedMenor && (
        <div>
          <h4 className="text-xs font-bold text-[#F6A5C0] uppercase tracking-wider mb-3">Historial de registros</h4>
          {loading ? (
            <p className="text-[#6667AB] text-xs">Cargando...</p>
          ) : registros.length === 0 ? (
            <div className="text-center py-8 text-[#6667AB] text-sm">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No hay registros de salud previos
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {registros.map(r => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2 text-[10px] text-[#6667AB]">
                    <Calendar className="w-3 h-3" />
                    {new Date(r.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    <Lock className="w-3 h-3 ml-auto text-[#6EE7B7]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {r.datosSalud.presionArterial && (
                      <div className="bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-[#6667AB]">Presión arterial</p>
                        <p className="text-xs text-white font-semibold">{r.datosSalud.presionArterial}</p>
                      </div>
                    )}
                    {r.datosSalud.frecuenciaCardiaca && (
                      <div className="bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-[#6667AB]">F. Cardíaca</p>
                        <p className="text-xs text-white font-semibold">{r.datosSalud.frecuenciaCardiaca}</p>
                      </div>
                    )}
                    {r.datosSalud.temperatura && (
                      <div className="bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-[#6667AB]">Temperatura</p>
                        <p className="text-xs text-white font-semibold">{r.datosSalud.temperatura}</p>
                      </div>
                    )}
                    {r.datosSalud.nivelEnergia && (
                      <div className="bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-[#6667AB]">Energía</p>
                        <p className="text-xs text-white font-semibold">{r.datosSalud.nivelEnergia}</p>
                      </div>
                    )}
                  </div>
                  {r.datosSalud.sintomas && (
                    <div className="mt-2 bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                      <p className="text-[10px] text-[#6667AB]">Síntomas</p>
                      <p className="text-xs text-white">{r.datosSalud.sintomas}</p>
                    </div>
                  )}
                  {r.datosSalud.medicacion && (
                    <div className="mt-1 bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                      <p className="text-[10px] text-[#6667AB]">Medicación</p>
                      <p className="text-xs text-white">{r.datosSalud.medicacion}</p>
                    </div>
                  )}
                  {r.datosSalud.observaciones && (
                    <div className="mt-1 bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                      <p className="text-[10px] text-[#6667AB]">Observaciones</p>
                      <p className="text-xs text-white">{r.datosSalud.observaciones}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
