'use client';

import { useMemo, useState } from 'react';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogosMarcasTarjeta } from './LogosPago';
import {
  detectarMarca,
  formatearNumeroTarjeta,
  formatearVencimiento,
  logPago,
  simularAutenticacionAdicional,
  simularPago,
  validarLuhn,
  vencimientoValido,
} from '../../../lib/pagos';
import { ResultadoExitoPago } from './PagoBilleteraBase';

interface PagoTarjetaProps {
  monto: number;
  onExito: (resultado: ResultadoExitoPago & { ultimos4?: string; cuotas?: number }) => void;
  onCancelar: () => void;
}

const OPCIONES_CUOTAS = [
  { value: 1, label: '1 cuota (sin interés)', tasa: 0 },
  { value: 3, label: '3 cuotas sin interés', tasa: 0 },
  { value: 6, label: '6 cuotas con interés (8%)', tasa: 0.08 },
  { value: 12, label: '12 cuotas con interés (15%)', tasa: 0.15 },
];

const TARJETA_GUARDADA_KEY = 'llevalope-tarjetas-guardadas';

export default function PagoTarjeta({ monto, onExito, onCancelar }: PagoTarjetaProps) {
  const [numero, setNumero] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [cuotas, setCuotas] = useState(1);
  const [guardarTarjeta, setGuardarTarjeta] = useState(false);
  const [estado, setEstado] = useState<'idle' | 'procesando' | 'requiere_autenticacion' | 'autenticando'>(
    'idle',
  );
  const [errores, setErrores] = useState<Record<string, string>>({});

  const marca = useMemo(() => detectarMarca(numero), [numero]);
  const numeroLimpio = numero.replace(/\D/g, '');
  const cvvLargo = marca === 'AMEX' ? 4 : 3;

  const opcionCuotas = OPCIONES_CUOTAS.find((o) => o.value === cuotas) || OPCIONES_CUOTAS[0];
  const montoConInteres = monto * (1 + opcionCuotas.tasa);
  const montoPorCuota = montoConInteres / cuotas;

  const validar = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!validarLuhn(numeroLimpio)) {
      nuevosErrores.numero = 'Número de tarjeta inválido';
    }
    if (nombreTitular.trim().length < 3) {
      nuevosErrores.nombreTitular = 'Ingresa el nombre tal como aparece en la tarjeta';
    }
    if (!vencimientoValido(vencimiento)) {
      nuevosErrores.vencimiento = 'Vencimiento inválido o tarjeta expirada';
    }
    if (cvv.replace(/\D/g, '').length !== cvvLargo) {
      nuevosErrores.cvv = `El CVV debe tener ${cvvLargo} dígitos`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarTarjetaLocal = () => {
    if (!guardarTarjeta || typeof window === 'undefined') return;
    try {
      const existentes = JSON.parse(window.localStorage.getItem(TARJETA_GUARDADA_KEY) || '[]');
      const nueva = {
        marca,
        ultimos4: numeroLimpio.slice(-4),
        nombreTitular,
        vencimiento,
        guardadaEn: new Date().toISOString(),
      };
      window.localStorage.setItem(
        TARJETA_GUARDADA_KEY,
        JSON.stringify([...existentes, nueva].slice(-5)),
      );
    } catch {
      // Simulación: si falla el almacenamiento local no es crítico.
    }
  };

  const procesarPago = async () => {
    if (!validar()) {
      toast.error('Revisa los datos de la tarjeta');
      return;
    }

    setEstado('procesando');
    logPago('TARJETA', 'procesando', { ultimos4: numeroLimpio.slice(-4), cuotas });

    const resultado = await simularPago('TARJETA', {
      numero: numeroLimpio,
      nombreTitular,
      vencimiento,
      cvv,
      cuotas,
    });

    if (resultado.estado === 'rechazado') {
      setEstado('idle');
      toast.error(resultado.mensaje);
      return;
    }

    if (resultado.estado === 'requiere_autenticacion') {
      setEstado('requiere_autenticacion');
      toast(resultado.mensaje, { icon: '🔐' });
      return;
    }

    guardarTarjetaLocal();
    toast.success('Pago con tarjeta aprobado');
    onExito({ numeroOperacion: resultado.numeroOperacion, ultimos4: resultado.ultimos4, cuotas });
  };

  const continuarAutenticacion = async () => {
    setEstado('autenticando');
    const resultado = await simularAutenticacionAdicional();
    guardarTarjetaLocal();
    toast.success('Autenticación exitosa, pago aprobado');
    onExito({ numeroOperacion: resultado.numeroOperacion, ultimos4: numeroLimpio.slice(-4), cuotas });
  };

  if (estado === 'requiere_autenticacion' || estado === 'autenticando') {
    return (
      <div className="space-y-5 text-center py-6">
        <Lock className="mx-auto text-dorado" size={40} />
        <h3 className="font-bold text-azul-oscuro text-lg">Autenticación adicional requerida</h3>
        <p className="text-sm text-gris-elegante max-w-sm mx-auto">
          Tu banco pide un paso extra de verificación (simulación de 3D Secure). Confirma para
          continuar con el pago.
        </p>
        <button
          type="button"
          onClick={continuarAutenticacion}
          disabled={estado === 'autenticando'}
          className="btn-primario inline-flex items-center gap-2"
        >
          {estado === 'autenticando' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Verificando...
            </>
          ) : (
            'Confirmar identidad'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-azul-oscuro">Pagar con tarjeta</h3>
        <LogosMarcasTarjeta marca={marca} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-azul-oscuro mb-1 block">Número de tarjeta</label>
          <input
            value={formatearNumeroTarjeta(numero)}
            onChange={(e) => setNumero(e.target.value)}
            inputMode="numeric"
            placeholder="4111 1111 1111 1111"
            className="input-campo"
            maxLength={23}
          />
          {errores.numero && <p className="text-xs text-red-600 mt-1">{errores.numero}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-azul-oscuro mb-1 block">Nombre del titular</label>
          <input
            value={nombreTitular}
            onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
            placeholder="JUAN PEREZ"
            className="input-campo"
          />
          {errores.nombreTitular && (
            <p className="text-xs text-red-600 mt-1">{errores.nombreTitular}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-azul-oscuro mb-1 block">Vencimiento (MM/YY)</label>
            <input
              value={vencimiento}
              onChange={(e) => setVencimiento(formatearVencimiento(e.target.value))}
              inputMode="numeric"
              placeholder="12/28"
              className="input-campo"
              maxLength={5}
            />
            {errores.vencimiento && (
              <p className="text-xs text-red-600 mt-1">{errores.vencimiento}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-azul-oscuro mb-1 block">CVV</label>
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, cvvLargo))}
              inputMode="numeric"
              placeholder={'•'.repeat(cvvLargo)}
              className="input-campo"
              maxLength={cvvLargo}
            />
            {errores.cvv && <p className="text-xs text-red-600 mt-1">{errores.cvv}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-azul-oscuro mb-1 block">Cuotas</label>
          <select
            value={cuotas}
            onChange={(e) => setCuotas(Number(e.target.value))}
            className="input-campo"
          >
            {OPCIONES_CUOTAS.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
          {cuotas > 1 && (
            <p className="text-xs text-gris-elegante mt-1">
              {cuotas} x{' '}
              {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
                montoPorCuota,
              )}{' '}
              ={' '}
              {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
                montoConInteres,
              )}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gris-elegante">
          <input
            type="checkbox"
            checked={guardarTarjeta}
            onChange={(e) => setGuardarTarjeta(e.target.checked)}
          />
          Guardar esta tarjeta para la próxima compra (solo simulación local)
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={procesarPago}
          disabled={estado === 'procesando'}
          className="btn-primario flex-1 flex items-center justify-center gap-2"
        >
          {estado === 'procesando' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Procesando pago...
            </>
          ) : (
            `Pagar ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
              montoConInteres,
            )}`
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
          Simulación: tarjetas terminadas en <strong>0000</strong> se rechazan y en{' '}
          <strong>1111</strong> piden autenticación adicional. Ningún dato se envía a un procesador
          real.
        </span>
      </div>
    </div>
  );
}
