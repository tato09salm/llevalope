'use client';

import { useEffect, useMemo, useState } from 'react';
import { Headphones, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { soporteAPI } from '../../../lib/api';
import { SOPORTE_ESTADOS_VISUALES, mapearEstadoVisualABackend, normalizarEstadoTicket } from '../../../lib/support';
import { TicketSoporte } from '../../../types';

const FILTROS = ['TODOS', ...SOPORTE_ESTADOS_VISUALES] as const;

export default function AdminSoportePage() {
  const [tickets, setTickets] = useState<TicketSoporte[]>([]);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<TicketSoporte | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<(typeof FILTROS)[number]>('TODOS');
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    cargarTickets();
  }, []);

  const cargarTickets = async () => {
    setCargando(true);
    try {
      const resp = await soporteAPI.listarAdmin();
      setTickets(resp || []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar los tickets');
      setTickets([]);
    } finally {
      setCargando(false);
    }
  };

  const verTicket = async (ticketId: number) => {
    try {
      const detalle = await soporteAPI.obtener(ticketId);
      setTicketSeleccionado(detalle);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar el detalle del ticket');
    }
  };

  const ticketsFiltrados = useMemo(
    () =>
      tickets.filter((ticket) => {
        if (filtroEstado === 'TODOS') return true;
        return normalizarEstadoTicket(ticket.estado) === filtroEstado;
      }),
    [tickets, filtroEstado],
  );

  const responderTicket = async () => {
    if (!ticketSeleccionado || !respuesta.trim()) {
      toast.error('Escribe una respuesta antes de enviar');
      return;
    }

    setEnviando(true);
    try {
      await soporteAPI.responder(ticketSeleccionado.id, respuesta.trim());
      setRespuesta('');
      toast.success('Respuesta enviada');
      await Promise.all([cargarTickets(), verTicket(ticketSeleccionado.id)]);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo responder el ticket');
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async (estadoVisual: (typeof FILTROS)[number]) => {
    if (!ticketSeleccionado || estadoVisual === 'TODOS') return;
    const estadoReal = mapearEstadoVisualABackend(estadoVisual);

    setActualizandoEstado(true);
    try {
      await soporteAPI.actualizarEstado(ticketSeleccionado.id, estadoReal);
      toast.success('Estado actualizado');
      await Promise.all([cargarTickets(), verTicket(ticketSeleccionado.id)]);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo actualizar el estado');
    } finally {
      setActualizandoEstado(false);
    }
  };

  return (
    <AdminShell
      title="Gestion de Soporte"
      description="Atiende tickets, responde mensajes y actualiza su estado operativo."
      icon={Headphones}
    >
      <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gris-elegante">Filtrar tickets:</span>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as (typeof FILTROS)[number])}
          className="input-campo max-w-xs"
        >
          {FILTROS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <div className="grid xl:grid-cols-[1fr_1fr] gap-6">
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          {cargando ? (
            <div className="flex justify-center py-20">
              <Loader2 size={36} className="animate-spin text-teal" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {ticketsFiltrados.length === 0 ? (
                <div className="text-center py-16 text-gris-elegante">No hay tickets en este estado.</div>
              ) : (
                ticketsFiltrados.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => verTicket(ticket.id)}
                    className={`w-full text-left p-5 hover:bg-crema transition-colors ${
                      ticketSeleccionado?.id === ticket.id ? 'bg-crema' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-azul-oscuro">{ticket.asunto}</p>
                        <p className="text-sm text-gris-elegante">
                          {ticket.usuario?.nombre} {ticket.usuario?.apellido} | {ticket.usuario?.correo}
                        </p>
                        <p className="text-xs text-gris-elegante mt-1">
                          {new Date(ticket.creadoEn).toLocaleString('es-PE')}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-medium">
                        {normalizarEstadoTicket(ticket.estado)}
                      </span>
                    </div>
                    {ticket.mensajes?.[0] && (
                      <p className="text-sm text-gris-elegante mt-3 line-clamp-2">
                        Ultimo mensaje: {ticket.mensajes[0].mensaje}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        <aside className="bg-white rounded-2xl shadow-card p-6">
          {!ticketSeleccionado ? (
            <div className="text-center text-gris-elegante py-16">
              Selecciona un ticket para ver el historial de mensajes.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <h2 className="text-lg font-bold text-azul-oscuro">{ticketSeleccionado.asunto}</h2>
                  <select
                    value={normalizarEstadoTicket(ticketSeleccionado.estado)}
                    onChange={(e) => cambiarEstado(e.target.value as (typeof FILTROS)[number])}
                    disabled={actualizandoEstado}
                    className="input-campo max-w-xs"
                  >
                    {SOPORTE_ESTADOS_VISUALES.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gris-elegante">
                  {ticketSeleccionado.usuario?.nombre} {ticketSeleccionado.usuario?.apellido} |{' '}
                  {ticketSeleccionado.usuario?.correo}
                </p>
                <p className="text-sm text-gris-elegante">
                  Categoria: {ticketSeleccionado.categoria} | Prioridad: {ticketSeleccionado.prioridad}
                </p>
                <div className="mt-4 bg-crema rounded-xl p-4 text-sm text-gris-elegante">
                  {ticketSeleccionado.descripcion}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-azul-oscuro mb-3">Mensajes</h3>
                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {(ticketSeleccionado.mensajes || []).map((mensaje) => (
                    <div
                      key={mensaje.id}
                      className={`rounded-xl p-4 text-sm ${
                        mensaje.esAgente ? 'bg-teal/10 text-azul-oscuro ml-8' : 'bg-crema text-gris-elegante mr-8'
                      }`}
                    >
                      <p className="font-medium mb-1">{mensaje.esAgente ? 'Agente' : 'Cliente'}</p>
                      <p>{mensaje.mensaje}</p>
                      <p className="text-xs text-gris-elegante mt-2">
                        {new Date(mensaje.creadoEn).toLocaleString('es-PE')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-azul-oscuro mb-3">Responder ticket</h3>
                <textarea
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  className="input-campo min-h-[130px]"
                  placeholder="Escribe la respuesta al cliente"
                />
                <button
                  onClick={responderTicket}
                  disabled={enviando}
                  className="btn-primario mt-3 inline-flex items-center gap-2"
                >
                  <Send size={16} /> {enviando ? 'Enviando...' : 'Enviar respuesta'}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}
