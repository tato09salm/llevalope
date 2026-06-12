'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Headphones, Loader2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import CuentaNav from '../../../components/cuenta/CuentaNav';
import { soporteAPI } from '../../../lib/api';
import { normalizarEstadoTicket } from '../../../lib/support';
import { useAuthStore } from '../../../store/auth.store';
import { TicketSoporte } from '../../../types';

export default function CuentaSoportePage() {
  const { usuario } = useAuthStore();
  const [tickets, setTickets] = useState<TicketSoporte[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    cargarTickets();
  }, [usuario]);

  const cargarTickets = async () => {
    setCargando(true);
    try {
      const resp = await soporteAPI.misTickets();
      setTickets(resp || []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar tus tickets');
      setTickets([]);
    } finally {
      setCargando(false);
    }
  };

  const ticketsOrdenados = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()),
    [tickets],
  );

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Inicia sesion para ver tus tickets</h1>
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
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-azul-oscuro flex items-center gap-3">
              <Headphones className="text-teal" /> Mi soporte
            </h1>
            <p className="text-gris-elegante mt-2">Consulta el estado de tus tickets y continua la conversacion con el equipo.</p>
          </div>
          <Link href="/soporte/nuevo-ticket" className="btn-primario inline-flex items-center gap-2">
            <PlusCircle size={18} /> Nuevo ticket
          </Link>
        </div>

        <CuentaNav />

        {cargando ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <Loader2 size={32} className="animate-spin text-teal mx-auto" />
          </div>
        ) : ticketsOrdenados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center">
            <p className="text-gris-elegante mb-4">Aun no has creado tickets de soporte.</p>
            <Link href="/soporte/nuevo-ticket" className="btn-secundario inline-flex items-center gap-2">
              <PlusCircle size={18} /> Crear primer ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ticketsOrdenados.map((ticket) => (
              <article key={ticket.id} className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-xs text-teal font-semibold mb-1">Ticket #{ticket.id}</p>
                    <h2 className="text-lg font-bold text-azul-oscuro">{ticket.asunto}</h2>
                    <p className="text-sm text-gris-elegante mt-1">
                      Categoria: {ticket.categoria} | Prioridad: {ticket.prioridad}
                    </p>
                    <p className="text-xs text-gris-elegante mt-2">
                      {new Date(ticket.creadoEn).toLocaleString('es-PE')}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span className="px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-medium">
                      {normalizarEstadoTicket(ticket.estado)}
                    </span>
                    <Link href={`/cuenta/soporte/${ticket.id}`} className="text-sm font-medium text-teal hover:underline">
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
