import { motion } from 'motion/react';
import {
  User, Mail, Phone, FileText, MapPin, Home, Baby, Heart,
  AlertTriangle, Lock, KeyRound, ChevronRight, AlertCircle, ShieldCheck, Check, Shield
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CIUDADES = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Huancayo', 'Iquitos'];

interface FormData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  numeroDocumento: string;
  direccion: string;
  ciudad: string;
  distrito: string;
  password: string;
  confirmPassword: string;
}

interface RegistrationFormProps {
  role: 'familia' | 'cuidadora';
  onChangeRole: () => void;
  onClose: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
  captchaVerified: boolean;
  onStartCaptcha: () => void;
}

export function RegistrationForm({
  role, onChangeRole, onClose, onOpenLegal,
  captchaVerified, onStartCaptcha,
}: RegistrationFormProps) {
  const { register } = useAuth();
  const isCuidadora = role === 'cuidadora';
  const [form, setForm] = useState<FormData>({
    nombres: '', apellidos: '', email: '', telefono: '', numeroDocumento: '',
    direccion: '', ciudad: '', distrito: '',
    password: '', confirmPassword: '',
  });
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [tieneHijos, setTieneHijos] = useState<'si' | 'no' | ''>('');
  const [cantidadHijos, setCantidadHijos] = useState('');
  const [edadesHijos, setEdadesHijos] = useState('');
  const [necesidadesEspeciales, setNecesidadesEspeciales] = useState('');
  const [emergenciaNombre, setEmergenciaNombre] = useState('');
  const [emergenciaTelefono, setEmergenciaTelefono] = useState('');
  const [emergenciaParentesco, setEmergenciaParentesco] = useState('');
  const [error, setError] = useState('');

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaVerified) { setError('Por favor, completa la verificación de seguridad.'); return; }
    if (!form.email || !form.password) { setError('Completa todos los campos obligatorios.'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (!form.telefono) { setError('Ingresa un número de teléfono.'); return; }

    if (isCuidadora) {
      if (!nombreCompleto.trim()) { setError('Ingresa tu nombre completo.'); return; }
    } else {
      if (!form.nombres || !form.apellidos) { setError('Ingresa nombre y apellido.'); return; }
      if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
      if (!emergenciaNombre || !emergenciaTelefono) { setError('Completa los datos de contacto de emergencia.'); return; }
    }

    const parts = isCuidadora
      ? nombreCompleto.trim().split(' ')
      : [form.nombres.trim(), form.apellidos.trim()];
    const nombres = parts[0] || '';
    const apellidos = isCuidadora ? parts.slice(1).join(' ') || '' : parts[1] || '';

    const err = await register({
      email: form.email,
      password: form.password,
      nombres,
      apellidos,
      rol: role,
      numeroDocumento: form.numeroDocumento || undefined,
    });
    if (err) setError(err); else onClose();
  };

  function Field({ label, icon: Icon, type = 'text', placeholder, value, onChange, required = true, hint }: {
    label: string; icon: React.ElementType; type?: string; placeholder: string;
    value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
    hint?: string;
  }) {
    return (
      <div>
        <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">
          {label} {required && '*'}
        </label>
        <div className="relative">
          <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6667AB]" />
          <input type={type} placeholder={placeholder} value={value} onChange={onChange}
            className="w-full pl-8 pr-3 py-2 text-xs bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
        </div>
        {hint && <p className="text-[9px] text-[#6667AB] mt-0.5">{hint}</p>}
      </div>
    );
  }

  function Section({ color, icon: Icon, step, title, children }: {
    color: string; icon: React.ElementType; step: string; title: string; children: React.ReactNode;
  }) {
    return (
      <div className="border-l-4 bg-[rgba(33,6,53,0.4)] backdrop-blur-sm rounded-r-xl rounded-l-sm p-3" style={{ borderLeftColor: color }}>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Icon className="w-3.5 h-3.5 text-[#F5D5E0]" />
          <span className="text-[9px] font-bold text-[#F5D5E0] tracking-widest uppercase">{step}</span>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
        </div>
        <h3 className="text-[11px] font-semibold text-white mb-2.5">{title}</h3>
        {children}
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className={`w-8 h-8 rounded-lg bg-[rgba(33,6,53,0.5)] backdrop-blur-sm flex items-center justify-center border border-[rgba(255,255,255,0.1)]`}>
          {isCuidadora ? (
            <Shield className="w-4 h-4 text-[#F6A5C0]" />
          ) : (
            <User className="w-4 h-4 text-[#F5D5E0]" />
          )}
        </div>
        <h2 className="text-base font-bold text-white">Crear cuenta en CERTINANAS</h2>
      </div>

      {error && (
        <div className="p-2.5 bg-[rgba(255,0,0,0.15)] border border-[rgba(255,0,0,0.3)] backdrop-blur-sm rounded-xl flex items-start gap-2 text-[11px] text-[#FF9999]">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{error}
        </div>
      )}

      {/* Role banner */}
      <div className="flex items-center justify-between bg-[rgba(102,103,171,0.15)] backdrop-blur-sm rounded-xl px-3 py-2 border border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2">
          {isCuidadora ? (
            <Shield className="w-3.5 h-3.5 text-[#CC8DB3]" />
          ) : (
            <User className="w-3.5 h-3.5 text-[#CC8DB3]" />
          )}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#F5D5E0]">
              Te registrarás como <span className="text-[#CC8DB3] capitalize">{role}</span>
            </span>
            {isCuidadora && (
              <span className="text-[9px] text-[#6667AB]">Tu postulación será revisada en max. 24h.</span>
            )}
          </div>
        </div>
        <button type="button" onClick={onChangeRole}
          className="px-2.5 py-1 text-[9px] font-bold text-[#CC8DB3] border border-[#CC8DB3] rounded-full hover:bg-[#CC8DB3]/10 transition-all shrink-0">
          Cambiar
        </button>
      </div>

      {isCuidadora ? (
        /* ---------- Cuidadora: formulario simple ---------- */
        <div className="space-y-3">
          <Field label="Nombre completo" icon={User} placeholder="Ej. María Fernández"
            value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} />
          <Field label="Teléfono" icon={Phone} type="tel" placeholder="999 888 777"
            value={form.telefono} onChange={set('telefono')} />
          <Field label="Correo electrónico" icon={Mail} type="email" placeholder="tu@email.com"
            value={form.email} onChange={set('email')} />
          <Field label="Contraseña" icon={Lock} type="password" placeholder="••••••"
            value={form.password} onChange={set('password')} hint="Mínimo 6 caracteres" />

          {/* reCAPTCHA */}
          <div>
            <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">Verificación de seguridad *</label>
            <div
              onClick={captchaVerified ? undefined : onStartCaptcha}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer select-none transition-all group ${
                captchaVerified
                  ? 'bg-[rgba(18,80,50,0.2)] border-emerald-500/40'
                  : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.15)] hover:border-[#6667AB]'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                captchaVerified
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-[#6667AB] group-hover:border-[#F5D5E0]'
              }`}>
                {captchaVerified && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-xs font-medium transition-colors ${captchaVerified ? 'text-emerald-300' : 'text-[#F5D5E0]'}`}>
                {captchaVerified ? 'Verificado' : 'No soy un robot'}
              </span>
              {captchaVerified
                ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                : <ShieldCheck className="w-3.5 h-3.5 text-[#6667AB] ml-auto" />
              }
            </div>
          </div>
        </div>
      ) : (
        /* ---------- Familia: formulario completo 5 pasos ---------- */
        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
          {/* Step 1 */}
          <Section color="#6667AB" icon={User} step="Paso I" title="Datos personales">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Nombres" icon={User} placeholder="María" value={form.nombres} onChange={set('nombres')} />
              <Field label="Apellidos" icon={User} placeholder="Pérez" value={form.apellidos} onChange={set('apellidos')} />
            </div>
            <div className="space-y-2 mt-2">
              <Field label="Correo electrónico" icon={Mail} type="email" placeholder="ejemplo@correo.com" value={form.email} onChange={set('email')} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Teléfono" icon={Phone} type="tel" placeholder="987 654 321" value={form.telefono} onChange={set('telefono')} />
                <Field label="Nro. documento" icon={FileText} placeholder="DNI / CE" value={form.numeroDocumento} onChange={set('numeroDocumento')} required={false} />
              </div>
            </div>
          </Section>

          {/* Step 2 */}
          <Section color="#7B337E" icon={MapPin} step="Paso II" title="Dirección del domicilio">
            <Field label="Dirección" icon={MapPin} placeholder="Av. Ejemplo 123, San Isidro" value={form.direccion} onChange={set('direccion')} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">Ciudad *</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6667AB]" />
                  <select value={form.ciudad} onChange={set('ciudad')}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all appearance-none">
                    <option value="" className="bg-[#210635]">Seleccionar</option>
                    {CIUDADES.map(c => <option key={c} value={c} className="bg-[#210635]">{c}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Distrito" icon={MapPin} placeholder="San Isidro" value={form.distrito} onChange={set('distrito')} required={false} />
            </div>
          </Section>

          {/* Step 3 */}
          <Section color="#CC8DB3" icon={Home} step="Paso III" title="Información del hogar">
            <div>
              <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">¿Tiene hijos? *</label>
              <div className="flex gap-2">
                {['si', 'no'].map(v => (
                  <button key={v} type="button" onClick={() => setTieneHijos(v as 'si' | 'no')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${
                      tieneHijos === v
                        ? 'bg-[#CC8DB3]/20 border-[#CC8DB3] text-white'
                        : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.15)] text-[#6667AB] hover:border-[rgba(255,255,255,0.3)]'
                    }`}>
                    {v === 'si' ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
            </div>
            {tieneHijos === 'si' && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">¿Cuántos? *</label>
                    <div className="relative">
                      <Baby className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6667AB]" />
                      <input type="number" min="0" placeholder="2" value={cantidadHijos} onChange={e => setCantidadHijos(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">Edades *</label>
                    <div className="relative">
                      <Heart className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6667AB]" />
                      <input type="text" placeholder="5 y 8 años" value={edadesHijos} onChange={e => setEdadesHijos(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">Necesidades especiales</label>
                  <div className="relative">
                    <Heart className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#6667AB]" />
                    <textarea placeholder="Describe brevemente..." value={necesidadesEspeciales} onChange={e => setNecesidadesEspeciales(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all resize-none h-16" />
                  </div>
                </div>
              </div>
            )}
            <p className="text-[9px] text-[#CC8DB3] mt-1.5">
              Después podrás registrar más detalles desde tu panel de control.
            </p>
          </Section>

          {/* Step 4 */}
          <Section color="#F6A5C0" icon={AlertTriangle} step="Paso IV" title="Contacto de emergencia">
            <div className="space-y-2">
              <Field label="Nombre completo" icon={User} placeholder="Carlos Pérez" value={emergenciaNombre} onChange={e => setEmergenciaNombre(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Teléfono" icon={Phone} type="tel" placeholder="987 654 321" value={emergenciaTelefono} onChange={e => setEmergenciaTelefono(e.target.value)} />
                <Field label="Parentesco" icon={User} placeholder="Esposo / Madre" value={emergenciaParentesco} onChange={e => setEmergenciaParentesco(e.target.value)} required={false} />
              </div>
            </div>
          </Section>

          {/* Step 5 */}
          <Section color="#F5D5E0" icon={Lock} step="Paso V" title="Datos de la cuenta">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Contraseña" icon={Lock} type="password" placeholder="••••••" value={form.password} onChange={set('password')} />
                <Field label="Confirmar contraseña" icon={KeyRound} type="password" placeholder="••••••" value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#F5D5E0] mb-1">Verificación de seguridad *</label>
                <div
                  onClick={captchaVerified ? undefined : onStartCaptcha}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer select-none transition-all group ${
                    captchaVerified
                      ? 'bg-[rgba(18,80,50,0.2)] border-emerald-500/40'
                      : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.15)] hover:border-[#6667AB]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    captchaVerified
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-[#6667AB] group-hover:border-[#F5D5E0]'
                  }`}>
                    {captchaVerified && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${captchaVerified ? 'text-emerald-300' : 'text-[#F5D5E0]'}`}>
                    {captchaVerified ? 'Verificado' : 'No soy un robot'}
                  </span>
                  {captchaVerified
                    ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                    : <ShieldCheck className="w-3.5 h-3.5 text-[#6667AB] ml-auto" />
                  }
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Footer */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-[#F5D5E0] hover:text-white transition-colors">
            Cancelar
          </button>
          <button type="submit"
            className="flex-1 py-2.5 bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:opacity-90 text-xs flex items-center justify-center gap-1.5">
            Crear cuenta <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center text-[9px] text-[#6667AB]">
          Al registrarte aceptas nuestros{' '}
          <button type="button" onClick={() => onOpenLegal('terms')} className="font-bold hover:underline text-[#CC8DB3]">Términos</button>
          {' '}y{' '}
          <button type="button" onClick={() => onOpenLegal('privacy')} className="font-bold hover:underline text-[#CC8DB3]">Política de Privacidad</button>
        </p>
      </div>
    </form>
  );
}
