'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShoppingCart, Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/auth.store';

export default function RegistrarPage() {
  const router = useRouter();
  const { registrar, cargando } = useAuthStore();
  const [mostrarPass, setMostrarPass] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', contrasena: '', telefono: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await registrar(form);
      toast.success('¡Cuenta creada con éxito! Bienvenido a LlevaloPe 🎉');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la cuenta');
    }
  };

  const campo = (key: keyof typeof form, label: string, type: string, placeholder: string, Icon: any, required = true) => (
    <div>
      <label className="label-campo">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-3.5 text-gris-elegante" />
        <input
          type={type === 'password' ? (mostrarPass ? 'text' : 'password') : type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          required={required}
          className="input-campo pl-10"
        />
        {type === 'password' && (
          <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="absolute right-3 top-3 text-gris-elegante">
            {mostrarPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-azul-oscuro via-azul-corp to-teal flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-dorado opacity-5 rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-premium p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-azul-oscuro rounded-xl flex items-center justify-center">
                <ShoppingCart size={22} className="text-dorado" />
              </div>
              <span className="font-montserrat font-bold text-2xl text-azul-oscuro">
                Lleva<span className="text-dorado">lo</span>Pe
              </span>
            </Link>
            <h1 className="text-2xl font-bold font-montserrat text-azul-oscuro">Crear Cuenta</h1>
            <p className="text-gris-elegante text-sm mt-1">Regístrate y empieza a comprar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {campo('nombre', 'Nombre', 'text', 'Juan', User)}
              {campo('apellido', 'Apellido', 'text', 'Pérez', User)}
            </div>
            {campo('correo', 'Correo electrónico', 'email', 'tu@correo.com', Mail)}
            {campo('telefono', 'Teléfono (opcional)', 'tel', '+51 999 999 999', Phone, false)}
            {campo('contrasena', 'Contraseña', 'password', 'Mínimo 6 caracteres', Lock)}

            <div className="flex items-start gap-2">
              <input type="checkbox" required className="mt-1 accent-teal" />
              <p className="text-xs text-gris-elegante">
                Acepto los{' '}
                <Link href="/terminos" className="text-teal hover:underline">Términos</Link>{' '}
                y la{' '}
                <Link href="/privacidad" className="text-teal hover:underline">Política de Privacidad</Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn-primario w-full text-center flex items-center justify-center gap-2 text-base"
            >
              {cargando ? <><Loader2 size={18} className="animate-spin" /> Creando cuenta...</> : 'Crear Cuenta Gratis'}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-gris-elegante text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/iniciar-sesion" className="text-teal font-semibold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
