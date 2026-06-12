'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CuentaNav from '../../components/cuenta/CuentaNav';
import { usuariosAPI } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function CuentaPage() {
  const router = useRouter();
  const { usuario, cargarPerfil } = useAuthStore();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setForm({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      telefono: usuario.telefono || '',
    });
  }, [usuario]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await usuariosAPI.actualizarPerfil(form);
      await cargarPerfil();
      toast.success('Perfil actualizado');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Necesitas iniciar sesion</h1>
          <p className="text-gris-elegante mb-6">Accede a tu cuenta para editar tu perfil.</p>
          <Link href="/auth/iniciar-sesion" className="btn-primario inline-block">
            Iniciar sesion
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-azul-oscuro mb-2">Mi cuenta</h1>
        <p className="text-gris-elegante mb-6">Gestiona tu perfil, direcciones y pedidos.</p>
        <CuentaNav />

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-azul-oscuro mb-4">Perfil editable</h2>
            <form onSubmit={guardar} className="grid md:grid-cols-2 gap-4">
              <input
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre"
                className="input-campo"
              />
              <input
                value={form.apellido}
                onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                placeholder="Apellido"
                className="input-campo"
              />
              <input
                value={usuario.correo}
                readOnly
                className="input-campo bg-gray-50 text-gris-elegante md:col-span-2"
              />
              <input
                value={form.telefono}
                onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                placeholder="Telefono"
                className="input-campo md:col-span-2"
              />
              <div className="md:col-span-2">
                <button type="submit" disabled={guardando} className="btn-primario">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-bold text-azul-oscuro mb-3">Resumen</h3>
              <div className="space-y-2 text-sm text-gris-elegante">
                <p>
                  Rol: <span className="font-medium text-azul-oscuro">{usuario.rol}</span>
                </p>
                <p>
                  Miembro desde:{' '}
                  <span className="font-medium text-azul-oscuro">
                    {new Date(usuario.creadoEn).toLocaleDateString('es-PE')}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
              <button onClick={() => router.push('/cuenta/direcciones')} className="btn-secundario w-full">
                Gestionar direcciones
              </button>
              <button onClick={() => router.push('/cuenta/pedidos')} className="btn-secundario w-full">
                Ver historial de pedidos
              </button>
              <button onClick={() => router.push('/cuenta/soporte')} className="btn-secundario w-full">
                Ver tickets de soporte
              </button>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
