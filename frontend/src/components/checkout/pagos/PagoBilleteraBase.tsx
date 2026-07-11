'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import QRDisplay from './QRDisplay';
import { LogoMetodo } from './LogosPago';
import {
  MetodoPagoUI,
  QR_DURACION_SEGUNDOS,
  formatearTiempoRestante,
  logPago,
  obtenerDefinicionMetodo,
  simularPago,
} from '../../../lib/pagos';

export interface ResultadoExitoPago {
  numeroOperacion?: string;
}

interface PagoBilleteraBaseProps {
  metodo: MetodoPagoUI;
  monto: number;
  numeroDestino: string;
  colorPrincipal?: string;
  onExito: (resultado: ResultadoExitoPago) => void;
  onCancelar: () => void;
}

/**
 * Flujo compartido de billeteras móviles peruanas (Yape, Plin, QR unificado,
 * Bim, Lukita): muestra QR real + número destino + timer de 5 minutos +
 * input para el número de operación que reporta el cliente + botón "Ya pagué".
 */
export default function PagoBilleteraBase({
  metodo,
  monto,
  numeroDestino,
  colorPrincipal = '#0D1B2A',
  onExito,
  onCancelar,
}: PagoBilleteraBaseProps) {
  const definicion = obtenerDefinicionMetodo(metodo);
  const [segundosRestantes, setSegundosRestantes] = useState(QR_DURACION_SEGUNDOS);
  const [codigoQR, setCodigoQR] = useState(() => generarCodigoQR());
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [estado, setEstado] = useState<'idle' | 'procesando' | 'error'>('idle');

  function generarCodigoQR() {
    return `LLEVALOPE-${metodo}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  useEffect(() => {
    if (segundosRestantes <= 0) return;
    const timer = setInterval(() => {
      setSegundosRestantes((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [segundosRestantes]);

  const regenerarQR = () => {
    setCodigoQR(generarCodigoQR());
    setSegundosRestantes(QR_DURACION_SEGUNDOS);
    toast.success('Se generó un nuevo código QR');
    logPago(metodo, 'qr_regenerado', {});
  };

  const confirmarPago = async () => {
    if (numeroOperacion.trim().length < 6) {
      toast.error('Ingresa un número de operación válido (mínimo 6 dígitos)');
      return;
    }
    if (segundosRestantes <= 0) {
      toast.error('El código QR expiró. Genera uno nuevo.');
      return;
    }

    setEstado('procesando');
    logPago(metodo, 'procesando', { numeroOperacion });
    const resultado = await simularPago(metodo);

    if (resultado.estado === 'aprobado') {
      toast.success(`Pago con ${definicion.label} confirmado`);
      onExito({ numeroOperacion: numeroOperacion.trim() });
    } else {
      setEstado('error');
      toast.error(resultado.mensaje);
    }
  };

  const expirado = segundosRestantes <= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <LogoMetodo id={metodo} size={40} />
        <div>
          <h3 className="font-bold text-azul-oscuro">Paga con {definicion.label}</h3>
          <p className="text-sm text-gris-elegante">Escanea el QR desde tu app o usa el número destino</p>
        </div>
      </div>

      <div className="bg-crema rounded-2xl p-6 flex flex-col items-center text-center gap-4">
        <QRDisplay valor={codigoQR} colorPrincipal={colorPrincipal} />

        <div>
          <p className="text-sm text-gris-elegante">Número destino</p>
          <p className="text-lg font-bold text-azul-oscuro tracking-wide">{numeroDestino}</p>
        </div>

        <div>
          <p className="text-sm text-gris-elegante">Monto a pagar</p>
          <p className="text-2xl font-bold text-azul-oscuro">
            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)}
          </p>
        </div>

        <div
          className={`text-sm font-semibold ${expirado ? 'text-red-600' : 'text-teal'}`}
          aria-live="polite"
        >
          {expirado ? 'Código QR expirado' : `Expira en ${formatearTiempoRestante(segundosRestantes)}`}
        </div>

        {expirado && (
          <button
            type="button"
            onClick={regenerarQR}
            className="btn-secundario flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} /> Generar nuevo código
          </button>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-azul-oscuro mb-1 block">
          Número de operación (lo verás en tu app al pagar)
        </label>
        <input
          value={numeroOperacion}
          onChange={(e) => setNumeroOperacion(e.target.value.replace(/\D/g, '').slice(0, 12))}
          inputMode="numeric"
          placeholder="Ej: 00123456"
          className="input-campo"
          disabled={estado === 'procesando' || expirado}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={confirmarPago}
          disabled={estado === 'procesando' || expirado}
          className="btn-primario flex-1 flex items-center justify-center gap-2"
        >
          {estado === 'procesando' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Verificando pago...
            </>
          ) : (
            'Ya pagué'
          )}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={estado === 'procesando'}
          className="btn-secundario"
        >
          Cambiar método
        </button>
      </div>

      <div className="flex items-start gap-2 text-xs text-gris-elegante">
        <ShieldCheck size={14} className="mt-0.5 text-teal shrink-0" />
        <span>
          Este es un pago simulado con fines de demostración. No se realiza ningún cobro real ni se
          conecta con {definicion.label}.
        </span>
      </div>
    </div>
  );
}
