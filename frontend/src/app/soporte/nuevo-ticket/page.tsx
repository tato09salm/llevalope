'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Headphones, Loader2, SendHorizonal } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { soporteAPI } from '../../../lib/api';
import { SOPORTE_CATEGORIAS, SOPORTE_PRIORIDADES } from '../../../lib/support';
import { useAuthStore } from '../../../store/auth.store';

export default function NuevoTicketPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    asunto: '',
    categoria: 'CONSULTA',
    prioridad: 'MEDIA',
    descripcion: '',
  });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const ticket = await soporteAPI.crearTicket({
        asunto: form.asunto.trim(),
        categoria: form.categoria,
        prioridad: form.prioridad,
        descripcion: form.descripcion.trim(),
      });
      toast.success('Ticket creado correctamente');
      router.push(`/cuenta/soporte/${ticket.id}`);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo crear el ticket');
    } finally {
      setGuardando(false);
    }
  };

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Inicia sesion para crear un ticket</h1>
          <p className="text-gris-elegante mb-6">Necesitas una cuenta para hacer seguimiento de tus solicitudes de soporte.</p>
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-sm text-teal font-semibold mb-2">Centro de soporte</p>
          <h1 className="text-3xl font-bold text-azul-oscuro flex items-center gap-3">
            <Headphones className="text-teal" /> Nuevo ticket
          </h1>
          <p className="text-gris-elegante mt-2">
            Cuéntanos tu consulta o inconveniente y te responderemos desde tu panel de cuenta.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.8fr] gap-6">
          <section className="bg-white rounded-2xl shadow-card p-6">
            <form onSubmit={enviar} className="space-y-5">
              <div>
                <label className="label-campo">Asunto</label>
                <input
                  value={form.asunto}
                  onChange={(e) => setForm((prev) => ({ ...prev, asunto: e.target.value }))}
                  className="input-campo"
                  placeholder="Ej. No puedo rastrear mi pedido"
                  maxLength={300}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label-campo">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
                    className="input-campo"
                  >
                    {SOPORTE_CATEGORIAS.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-campo">Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm((prev) => ({ ...prev, prioridad: e.target.value }))}
                    className="input-campo"
                  >
                    {SOPORTE_PRIORIDADES.map((prioridad) => (
                      <option key={prioridad} value={prioridad}>
                        {prioridad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-campo">Descripcion</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  className="input-campo min-h-[180px]"
                  placeholder="Describe el problema con el mayor detalle posible"
                  maxLength={5000}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button disabled={guardando} className="btn-primario inline-flex items-center gap-2">
                  {guardando ? <Loader2 size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
                  {guardando ? 'Enviando...' : 'Crear ticket'}
                </button>
                <Link href="/cuenta/soporte" className="btn-secundario inline-flex items-center">
                  Ver mis tickets
                </Link>
              </div>
            </form>
          </section>

          <aside className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-azul-oscuro">Antes de enviar</h2>
            <div className="space-y-3 text-sm text-gris-elegante">
              <p>Incluye el numero de pedido si tu consulta esta relacionada con una compra.</p>
              <p>Usa una prioridad alta solo cuando el problema impide completar o recibir un pedido.</p>
              <p>Podras revisar el historial del ticket y responder desde tu cuenta.</p>
            </div>
            <div className="bg-crema rounded-xl p-4 text-sm text-gris-elegante">
              <p className="font-medium text-azul-oscuro mb-1">Canal recomendado</p>
              <p>Para temas de pago, envio o devoluciones, selecciona la categoria correspondiente para acelerar la atencion.</p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
