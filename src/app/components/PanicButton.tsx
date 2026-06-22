import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type PanicButtonProps = {
  orderId: number | null;
  onActivate?: () => void;
  fixed?: boolean;
};

export function PanicButton({ orderId, onActivate, fixed = false }: PanicButtonProps) {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const HOLD_DURATION = 3000;

  const startPress = useCallback(() => {
    if (!orderId || activated) return;
    setPressing(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / HOLD_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(timerRef.current!);
        setPressing(false);
        setProgress(0);
        handleActivate();
      }
    }, 30);
  }, [orderId, activated]);

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleActivate = async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const r = await fetch('/api/incidentes/reportar', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        }),
      });
      if (r.ok) {
        setActivated(true);
        setShowConfirm(true);
        onActivate?.();
      } else {
        const data = await r.json();
        setError(data.error || 'Error al reportar el incidente');
      }
    } catch {
      setError('No se pudo obtener la ubicación');
    }
    setLoading(false);
  };

  if (!orderId) return null;

  const SIZE = 72;
  const RADIUS = 30;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE * (1 - progress);

  const button = (
    <div className="relative inline-flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="absolute -rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#F6A5C0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={pressing ? offset : CIRCUMFERENCE}
          className="transition-none"
        />
      </svg>
      <motion.button
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        disabled={activated || loading}
        animate={!activated ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0 0 rgba(209,66,66,0.4)',
            '0 0 0 16px rgba(209,66,66,0)',
          ],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: SIZE - 8,
          height: SIZE - 8,
          backgroundColor: activated ? '#10B981' : '#D14242',
          boxShadow: activated ? '0 0 20px rgba(16,185,129,0.5)' : '0 0 20px rgba(209,66,66,0.4)',
        }}
        className="rounded-full flex items-center justify-center text-white relative z-10 focus:outline-none disabled:opacity-70"
      >
        {activated ? <Shield className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
      </motion.button>
      {pressing && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 text-[10px] text-red-300 font-bold whitespace-nowrap"
        >
          {Math.round(progress * 100)}%
        </motion.span>
      )}
    </div>
  );

  return (
    <>
      {fixed ? (
        <div className="fixed bottom-6 right-6 z-50">
          {button}
        </div>
      ) : button}

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-3xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.2)] flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#6EE7B7]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Incidente Reportado</h3>
              <p className="text-sm text-[#F5D5E0]/70 mb-6">
                El equipo CERTINANAS ha sido notificado. Recibirás asistencia a la brevedad.
              </p>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 bg-[#F6A5C0] text-[#210635] rounded-xl text-sm font-bold"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 mt-2"
        >
          {error}
        </motion.p>
      )}
    </>
  );
}
