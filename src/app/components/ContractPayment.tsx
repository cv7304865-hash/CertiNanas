import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { ServiceRequest } from './CaregiverDashboard';
import { COMMISSION_RATE } from './CaregiverDashboard';
import type { CaregiverApplication } from './AdminDashboard';

type Props = {
  request: ServiceRequest;
  caregiver?: CaregiverApplication;
  familyFullName: string;
  contractNumber: string;
  onBack: () => void;
  onSign: () => void;
};

export function ContractPayment({ request, caregiver, familyFullName, contractNumber, onBack, onSign }: Props) {
  const [accepted, setAccepted] = useState(false);
  const total = request.rate * request.hours;
  const commission = total * COMMISSION_RATE;
  const caregiverShare = total - commission;
  const formatSoles = (n: number) => `S/ ${n.toFixed(2)}`;
  const caregiverName = caregiver ? `${caregiver.nombres} ${caregiver.apellidos}` : 'Cuidadora asignada';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#1E3A8A] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8 flex items-start gap-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#1E3A8A]" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-xl">Contrato de Servicio N° {contractNumber}</h1>
              <p className="text-gray-500 text-sm mt-1">Generado automáticamente por CERTINANAS</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Familia Contratante</p>
                  <p className="text-gray-900 font-bold mt-1">{familyFullName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Cuidadora</p>
                  <p className="text-gray-900 font-bold mt-1">{caregiverName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Menor</p>
                  <p className="text-gray-900 font-bold mt-1">{request.childName} ({request.childCondition})</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Servicio</p>
                  <p className="text-gray-900 font-bold mt-1">{request.date} · {request.hours}h</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
              <p className="text-orange-900 font-bold text-2xl">Monto total: {formatSoles(total)}</p>
              <p className="text-orange-800 text-sm mt-2">
                Comisión CERTINANAS: {formatSoles(commission)} · Pago a cuidadora: {formatSoles(caregiverShare)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-bold text-gray-800">Términos del Servicio Escrow:</span> Al aceptar, el monto será retenido por la pasarela de pagos hasta la conformidad del servicio. La liberación se realizará al cierre sin incidencias graves pendientes.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-400 cursor-pointer shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                Acepto los Términos del Servicio y la Política de Datos Sensibles (Ley N° 29733).
              </span>
            </label>

            <button
              disabled={!accepted}
              onClick={onSign}
              className={`w-full py-4 rounded-xl font-bold transition-colors ${
                accepted
                  ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Firmar y proceder al pago
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
