import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function SignatureCanvas({ ordenId, tipo, onComplete }: { ordenId: number; tipo: 'familia' | 'cuidadora'; onComplete?: () => void }) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [firmaData, setFirmaData] = useState('');
  const [step, setStep] = useState<'firma' | 'otp'>('firma');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(33,6,53,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    setFirmaData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(33,6,53,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setFirmaData('');
  };

  const handleSaveFirma = async () => {
    if (!firmaData) return;
    setSaving(true);
    setError('');
    try {
      const r = await fetch('/api/firmas/guardar-firma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) },
        body: JSON.stringify({ IdOrden: ordenId, tipo, firmaData }),
      });
      const data = await r.json();
      if (r.ok) {
        setStep('otp');
        if (data.otp) {
          alert(`Código OTP enviado por SMS: ${data.otp}`);
        }
      } else {
        setError(data.error || 'Error al guardar firma');
      }
    } catch {
      setError('Error de conexión');
    }
    setSaving(false);
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) {
      const input = document.getElementById(`otp-${i + 1}`);
      input?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setVerifying(true);
    setError('');
    try {
      const r = await fetch('/api/firmas/verificar-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IdOrden: ordenId, tipo, codigo: code }),
      });
      if (r.ok) {
        setSuccess(true);
        onComplete?.();
      } else {
        const data = await r.json();
        setError(data.error || 'Código inválido');
      }
    } catch {
      setError('Error de conexión');
    }
    setVerifying(false);
  };

  if (success) {
    return (
      <div className="bg-[rgba(16,185,129,0.12)] rounded-xl p-4 text-center">
        <p className="text-[#6EE7B7] text-sm font-bold">✓ Firma verificada correctamente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#F6A5C0] uppercase tracking-wider">
        {tipo === 'familia' ? 'Firma del Cliente' : 'Firma de la Cuidadora'}
      </p>

      {step === 'firma' && (
        <>
          <div className="border border-[rgba(255,255,255,0.15)] rounded-xl overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[150px] cursor-crosshair"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[#6667AB]">Firma manuscrita digital</p>
            <div className="flex gap-2">
              {hasDrawn && (
                <button onClick={clearCanvas} className="px-3 py-1 text-[10px] text-[#6667AB] hover:text-white transition-colors">
                  Limpiar
                </button>
              )}
              <button
                onClick={handleSaveFirma}
                disabled={!hasDrawn || saving}
                className="px-4 py-1.5 rounded-lg bg-[#F6A5C0] text-[#210635] text-[10px] font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Firma'}
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'otp' && (
        <>
          <p className="text-xs text-[#F5D5E0]/70">Hemos enviado un código de verificación OTP de 6 dígitos a tu teléfono registrado.</p>
          <div className="flex items-center justify-center gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                maxLength={1}
                className="w-10 h-12 text-center text-lg font-bold text-white bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] rounded-lg"
              />
            ))}
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={otp.join('').length !== 6 || verifying}
            className="w-full px-4 py-2 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
          >
            {verifying ? 'Verificando...' : 'Verificar código OTP'}
          </button>
        </>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
