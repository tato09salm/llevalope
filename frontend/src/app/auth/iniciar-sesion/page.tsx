'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShoppingCart, Loader2, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/auth.store';

export default function IniciarSesionPage() {
  const router = useRouter();
  const { iniciarSesion, cargando } = useAuthStore();
  const [mostrarPass, setMostrarPass] = useState(false);
  const [form, setForm] = useState({ correo: '', contrasena: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await iniciarSesion(form.correo, form.contrasena);
      toast.success('¡Bienvenido de vuelta!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-azul-oscuro via-azul-corp to-teal flex items-center justify-center p-4">
      {/* Decoración */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-dorado opacity-5 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-premium p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-azul-oscuro rounded-xl flex items-center justify-center">
                <ShoppingCart size={22} className="text-dorado" />
              </div>
              <span className="font-montserrat font-bold text-2xl text-azul-oscuro">
                Lleva<span className="text-dorado">lo</span>Pe
              </span>
            </Link>
            <h1 className="text-2xl font-bold font-montserrat text-azul-oscuro">¡Bienvenido!</h1>
            <p className="text-gris-elegante text-sm mt-1">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-campo">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-gris-elegante" />
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  placeholder="tu@correo.com"
                  required
                  className="input-campo pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-campo">Contraseña</label>
                <Link href="/auth/recuperar" className="text-xs text-teal hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-gris-elegante" />
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  value={form.contrasena}
                  onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                  placeholder="Tu contraseña"
                  required
                  className="input-campo pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-3 top-3 text-gris-elegante hover:text-azul-oscuro"
                >
                  {mostrarPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn-primario w-full text-center flex items-center justify-center gap-2 text-base"
            >
              {cargando ? (
                <><Loader2 size={18} className="animate-spin" /> Iniciando sesión...</>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gris-elegante text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/registrar" className="text-teal font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Credenciales demo */}
          <div className="mt-6 bg-crema rounded-xl p-4 border border-dorado border-opacity-30">
            <p className="text-xs font-bold text-azul-oscuro mb-1">Cuenta demo:</p>
            <p className="text-xs text-gris-elegante">admin@llevalope.pe / Admin123!</p>
          </div>
        </div>

        <p className="text-center text-white text-opacity-60 text-xs mt-6">
          Al iniciar sesión aceptas nuestros{' '}
          <Link href="/terminos" className="underline hover:text-dorado">
            Términos y Condiciones
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
