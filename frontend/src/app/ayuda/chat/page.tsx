'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Send, User, MessageCircle, ArrowLeft, SendHorizontal, ShieldAlert, Sparkles, Smile } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';

interface Mensaje {
  id: number;
  remitente: 'agente' | 'usuario';
  texto: string;
  hora: string;
}

export default function ChatPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      remitente: 'agente',
      texto: '¡Hola! Bienvenido al chat en línea de LlevaloPe. ¿En qué puedo ayudarte hoy?',
      hora: 'Hace un momento'
    }
  ]);
  const [input, setInput] = useState('');

  const enviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const nuevoMensaje: Mensaje = {
      id: Date.now(),
      remitente: 'usuario',
      texto: input,
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes(prev => [...prev, nuevoMensaje]);
    setInput('');

    // Respuesta automática simulada
    setTimeout(() => {
      setMensajes(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'agente',
          texto: 'Aún no está disponible este módulo pero seguimos trabajando para ofrecerte atención en vivo próximamente. ¡Gracias por tu paciencia!',
          hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/ayuda"
            className="inline-flex items-center gap-1.5 text-xs text-gris-elegante hover:text-teal font-semibold transition-colors"
          >
            <ArrowLeft size={14} /> Volver a Ayuda
          </Link>
          <div className="flex items-center gap-1 text-xs text-teal font-semibold bg-teal bg-opacity-10 px-3 py-1 rounded-full">
            <Sparkles size={12} className="animate-spin" /> Soporte en Vivo
          </div>
        </div>

        {/* Ventana de Chat */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden flex flex-col h-[600px] mb-8">
          {/* Cabecera del Chat */}
          <div className="bg-azul-oscuro text-white p-4 md:p-6 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-dorado flex items-center justify-center text-azul-oscuro font-bold text-lg">
                LP
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-azul-oscuro rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg leading-tight">Asistente LlevaloPe</h3>
              <p className="text-crema text-xs text-opacity-80">Tiempo estimado de respuesta: 1 min</p>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-crema bg-opacity-20 space-y-4">
            {/* Aviso Informativo Fijo */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left">
              <ShieldAlert className="text-amber-500 mt-0.5 shrink-0" size={18} />
              <div>
                <h4 className="text-xs font-bold text-amber-800">Canal de Chat en desarrollo</h4>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-normal">
                  Aún no está disponible este módulo pero seguimos trabajando para habilitar la atención directa en tiempo real. Puedes interactuar con nuestro simulador o crear un ticket de soporte formal para tu atención.
                </p>
              </div>
            </div>

            {/* Mensajes del chat */}
            {mensajes.map((msg) => {
              const esAgente = msg.remitente === 'agente';
              return (
                <div
                  key={msg.id}
                  className={`flex ${esAgente ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm text-sm ${
                      esAgente
                        ? 'bg-white text-azul-oscuro rounded-tl-none border border-gray-100'
                        : 'bg-teal text-white rounded-tr-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.texto}</p>
                    <span
                      className={`block text-[10px] mt-1.5 text-right ${
                        esAgente ? 'text-gris-elegante' : 'text-teal-100'
                      }`}
                    >
                      {msg.hora}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input del Chat */}
          <form onSubmit={enviarMensaje} className="p-4 border-t border-gray-100 bg-white flex gap-3 items-center">
            <input
              type="text"
              placeholder="Escribe tu mensaje aquí..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dorado focus:border-transparent text-sm text-azul-oscuro"
            />
            <button
              type="submit"
              className="w-11 h-11 bg-teal hover:bg-teal-dark text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              title="Enviar"
            >
              <SendHorizontal size={18} />
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
