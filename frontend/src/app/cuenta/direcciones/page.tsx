'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import CuentaNav from '../../../components/cuenta/CuentaNav';
import { usuariosAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import { DireccionUsuario } from '../../../types';

const FORM_INICIAL = {
  alias: 'Casa',
  nombres: '',
  apellidos: '',
  telefono: '',
  departamento: 'La Libertad',
  provincia: 'Trujillo',
  distrito: '',
  direccion: '',
  referencia: '',
  predeterminada: false,
};

const crearFormularioInicial = (usuario?: {
  nombre?: string;
  apellido?: string;
  telefono?: string;
} | null) => ({
  ...FORM_INICIAL,
  alias: 'Casa',
  nombres: usuario?.nombre || '',
  apellidos: usuario?.apellido || '',
  telefono: usuario?.telefono || '',
});

export default function DireccionesPage() {
  const { usuario } = useAuthStore();
  const [direcciones, setDirecciones] = useState<DireccionUsuario[]>([]);
  const [form, setForm] = useState(() => crearFormularioInicial(usuario));
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    cargarDirecciones();
  }, [usuario]);

  useEffect(() => {
    if (editandoId) return;
    setForm(crearFormularioInicial(usuario));
  }, [usuario, editandoId]);

  const cargarDirecciones = async () => {
    try {
      const resp: any = await usuariosAPI.listarDirecciones();
      setDirecciones(Array.isArray(resp) ? resp : []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar las direcciones');
    }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    const payload = {
      ...form,
      alias: form.alias || 'Casa',
      nombreCompleto: [form.nombres, form.apellidos].filter(Boolean).join(' ').trim(),
    };

    try {
      if (editandoId) {
        await usuariosAPI.actualizarDireccion(editandoId, payload);
        toast.success('Direccion actualizada');
      } else {
        await usuariosAPI.crearDireccion(payload);
        toast.success('Direccion agregada');
      }
      setForm(crearFormularioInicial(usuario));
      setEditandoId(null);
      await cargarDirecciones();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la direccion');
    } finally {
      setGuardando(false);
    }
  };

  const editar = (direccion: DireccionUsuario) => {
    const partesNombre = (direccion.nombreCompleto || '').trim().split(/\s+/);
    const nombres = partesNombre.length > 1 ? partesNombre.slice(0, -1).join(' ') : partesNombre[0] || '';
    const apellidos = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : '';
    setEditandoId(direccion.id);
    setForm({
      alias: direccion.alias,
      nombres,
      apellidos,
      telefono: direccion.telefono,
      departamento: direccion.departamento,
      provincia: direccion.provincia,
      distrito: direccion.distrito,
      direccion: direccion.direccion,
      referencia: direccion.referencia || '',
      predeterminada: direccion.predeterminada,
    });
  };

  const eliminar = async (id: number) => {
    try {
      await usuariosAPI.eliminarDireccion(id);
      toast.success('Direccion eliminada');
      if (editandoId === id) {
        setEditandoId(null);
        setForm(crearFormularioInicial(usuario));
      }
      await cargarDirecciones();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo eliminar la direccion');
    }
  };

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Inicia sesion para ver tus direcciones</h1>
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
        <h1 className="text-3xl font-bold text-azul-oscuro mb-2">Mis direcciones</h1>
        <p className="text-gris-elegante mb-6">Gestiona multiples direcciones y marca una como predeterminada.</p>
        <CuentaNav />

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-azul-oscuro mb-4">
              {editandoId ? 'Editar direccion' : 'Nueva direccion'}
            </h2>
            <form onSubmit={guardar} className="grid md:grid-cols-2 gap-4">
              <input
                value={form.alias}
                onChange={(e) => setForm((prev) => ({ ...prev, alias: e.target.value }))}
                placeholder="Alias"
                className="input-campo"
                required
              />
              <input
                value={form.nombres}
                onChange={(e) => setForm((prev) => ({ ...prev, nombres: e.target.value }))}
                placeholder="Nombres"
                className="input-campo"
                required
              />
              <input
                value={form.apellidos}
                onChange={(e) => setForm((prev) => ({ ...prev, apellidos: e.target.value }))}
                placeholder="Apellidos"
                className="input-campo"
                required
              />
              <input
                value={form.telefono}
                onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                placeholder="Telefono"
                className="input-campo"
                required
              />
              <input
                value={form.departamento}
                onChange={(e) => setForm((prev) => ({ ...prev, departamento: e.target.value }))}
                placeholder="Departamento"
                className="input-campo"
                required
              />
              <input
                value={form.provincia}
                onChange={(e) => setForm((prev) => ({ ...prev, provincia: e.target.value }))}
                placeholder="Provincia"
                className="input-campo"
                required
              />
              <input
                value={form.distrito}
                onChange={(e) => setForm((prev) => ({ ...prev, distrito: e.target.value }))}
                placeholder="Distrito"
                className="input-campo"
                required
              />
              <input
                value={form.direccion}
                onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))}
                placeholder="Direccion"
                className="input-campo md:col-span-2"
                required
              />
              <input
                value={form.referencia}
                onChange={(e) => setForm((prev) => ({ ...prev, referencia: e.target.value }))}
                placeholder="Referencia"
                className="input-campo md:col-span-2"
              />
              <label className="md:col-span-2 flex items-center gap-2 text-sm text-gris-elegante">
                <input
                  type="checkbox"
                  checked={form.predeterminada}
                  onChange={(e) => setForm((prev) => ({ ...prev, predeterminada: e.target.checked }))}
                />
                Marcar como predeterminada
              </label>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={guardando} className="btn-primario">
                  {guardando ? 'Guardando...' : editandoId ? 'Actualizar direccion' : 'Guardar direccion'}
                </button>
                {editandoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoId(null);
                      setForm(crearFormularioInicial(usuario));
                    }}
                    className="btn-secundario"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="space-y-4">
            {direcciones.map((direccion) => (
              <article key={direccion.id} className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-azul-oscuro">
                      {direccion.alias} {direccion.predeterminada ? '(Predeterminada)' : ''}
                    </h3>
                    <p className="text-sm text-gris-elegante mt-1">
                      {direccion.nombreCompleto} - {direccion.telefono}
                    </p>
                    <p className="text-sm text-gris-elegante">
                      {direccion.direccion}, {direccion.distrito}, {direccion.provincia}, {direccion.departamento}
                    </p>
                    {direccion.referencia && (
                      <p className="text-xs text-gris-elegante mt-1">Referencia: {direccion.referencia}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editar(direccion)} className="btn-secundario text-sm">
                      Editar
                    </button>
                    <button onClick={() => eliminar(direccion.id)} className="btn-secundario text-sm text-red-600">
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {direcciones.length === 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6 text-gris-elegante">
                Aun no has guardado direcciones.
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
