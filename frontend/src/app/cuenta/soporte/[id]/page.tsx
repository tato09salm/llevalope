'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, SendHorizonal } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import CuentaNav from '../../../../components/cuenta/CuentaNav';
import { soporteAPI } from '../../../../lib/api';
import { normalizarEstadoTicket } from '../../../../lib/support';
import { useAuthStore } from '../../../../store/auth.store';
import { TicketSoporte } from '../../../../types';

export default function TicketDetallePage() {
  const params = useParams<{ id: string }>();
  const { usuario } = useAuthStore();
  const [ticket, setTicket] = useState<TicketSoporte | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!usuario || !params?.id) return;
    cargarTicket();
  }, [usuario, params?.id]);

  const cargarTicket = async () => {
    setCargando(true);
    try {
      const resp = await soporteAPI.obtener(Number(params.id));
      setTicket(resp);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar el ticket');
      setTicket(null);
    } finally {
      setCargando(false);
    }
  };

  const responder = async () => {
    if (!ticket || !mensaje.trim()) {
      toast.error('Escribe un mensaje antes de responder');
      return;
    }

    setEnviando(true);
    try {
      await soporteAPI.responder(ticket.id, mensaje.trim());
      setMensaje('');
      toast.success('Respuesta enviada');
      await cargarTicket();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo enviar la respuesta');
    } finally {
      setEnviando(false);
    }
  };

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Inicia sesion para ver tu ticket</h1>
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
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link href="/cuenta/soporte" className="text-teal hover:underline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Volver a soporte
          </Link>
        </div>
        <CuentaNav />

        {cargando ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center">
            <Loader2 size={32} className="animate-spin text-teal mx-auto" />
          </div>
        ) : !ticket ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gris-elegante">
            No se encontro el ticket solicitado.
          </div>
        ) : (
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
            <aside className="bg-white rounded-2xl shadow-card p-6 space-y-4">
              <div>
                <p className="text-xs text-teal font-semibold mb-1">Ticket #{ticket.id}</p>
                <h1 className="text-2xl font-bold text-azul-oscuro">{ticket.asunto}</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-medium">
                  {normalizarEstadoTicket(ticket.estado)}
                </span>
                <span className="px-3 py-1 rounded-full bg-crema text-azul-oscuro text-xs font-medium">
                  {ticket.categoria}
                </span>
                <span className="px-3 py-1 rounded-full bg-crema text-azul-oscuro text-xs font-medium">
                  {ticket.prioridad}
                </span>
              </div>
              <div className="bg-crema rounded-xl p-4 text-sm text-gris-elegante">
                <p className="font-medium text-azul-oscuro mb-2">Descripcion inicial</p>
                <p>{ticket.descripcion}</p>
              </div>
              <p className="text-xs text-gris-elegante">
                Creado el {new Date(ticket.creadoEn).toLocaleString('es-PE')}
              </p>
            </aside>

            <section className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-xl font-bold text-azul-oscuro mb-4">Hilo de mensajes</h2>
              <div className="space-y-3 max-h-[420px] overflow-auto pr-1 mb-6">
                {(ticket.mensajes || []).length === 0 ? (
                  <div className="bg-crema rounded-xl p-4 text-sm text-gris-elegante">
                    Aun no hay respuestas en este ticket.
                  </div>
                ) : (
                  (ticket.mensajes || []).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl p-4 text-sm ${
                        item.esAgente ? 'bg-teal/10 text-azul-oscuro mr-8' : 'bg-crema text-gris-elegante ml-8'
                      }`}
                    >
                      <p className="font-medium mb-1">{item.esAgente ? 'Soporte LlevaloPe' : 'Tu mensaje'}</p>
                      <p>{item.mensaje}</p>
                      <p className="text-xs text-gris-elegante mt-2">
                        {new Date(item.creadoEn).toLocaleString('es-PE')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-semibold text-azul-oscuro mb-3">Responder ticket</h3>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="input-campo min-h-[140px]"
                  placeholder="Escribe aqui cualquier informacion adicional para soporte"
                />
                <button onClick={responder} disabled={enviando} className="btn-primario mt-3 inline-flex items-center gap-2">
                  {enviando ? <Loader2 size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
                  {enviando ? 'Enviando...' : 'Enviar respuesta'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
