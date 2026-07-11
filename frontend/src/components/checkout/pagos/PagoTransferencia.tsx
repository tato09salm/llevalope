'use client';

import { useMemo, useState } from 'react';
import { Loader2, ShieldCheck, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoTransferencia } from './LogosPago';
import { generarCCI, logPago, simularPago } from '../../../lib/pagos';

interface PagoTransferenciaProps {
  monto: number;
  onExito: (resultado: { voucherNombre?: string }) => void;
  onCancelar: () => void;
}

export default function PagoTransferencia({ monto, onExito, onCancelar }: PagoTransferenciaProps) {
  const cci = useMemo(() => generarCCI(), []);
  const [voucher, setVoucher] = useState<File | null>(null);
  const [estado, setEstado] = useState<'idle' | 'procesando'>('idle');

  const confirmarEnvio = async () => {
    if (!voucher) {
      toast.error('Adjunta el voucher de tu transferencia');
      return;
    }

    setEstado('procesando');
    logPago('TRANSFERENCIA', 'procesando', { voucherNombre: voucher.name });
    await simularPago('TRANSFERENCIA');

    toast.success('Voucher recibido, tu pedido quedará pendiente de verificación');
    onExito({ voucherNombre: voucher.name });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <LogoTransferencia size={40} />
        <div>
          <h3 className="font-bold text-azul-oscuro">Transferencia bancaria</h3>
          <p className="text-sm text-gris-elegante">
            Realiza la transferencia y adjunta tu voucher para verificarla
          </p>
        </div>
      </div>

      <div className="bg-crema rounded-2xl p-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gris-elegante">Banco</span>
          <span className="font-semibold text-azul-oscuro">BCP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gris-elegante">Titular</span>
          <span className="font-semibold text-azul-oscuro">LlevaloPe S.A.C.</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gris-elegante">Cuenta corriente</span>
          <span className="font-semibold text-azul-oscuro">193-2547896-0-14</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gris-elegante">CCI</span>
          <span className="font-semibold text-azul-oscuro">{cci}</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="text-gris-elegante">Monto a transferir</span>
          <span className="font-bold text-azul-oscuro">
            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)}
          </span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-azul-oscuro mb-1 block">Adjuntar voucher</label>
        <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-teal">
          <UploadCloud size={20} className="text-teal shrink-0" />
          <span className="text-sm text-gris-elegante truncate">
            {voucher ? voucher.name : 'Selecciona una imagen o PDF del voucher'}
          </span>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setVoucher(e.target.files?.[0] || null)}
          />
        </label>
        <p className="text-xs text-gris-elegante mt-1">
          Simulación: solo se guarda el nombre del archivo, no se sube a ningún servidor.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={confirmarEnvio}
          disabled={estado === 'procesando'}
          className="btn-primario flex-1 flex items-center justify-center gap-2"
        >
          {estado === 'procesando' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Enviando voucher...
            </>
          ) : (
            'Ya transferí, enviar voucher'
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
          Tu pedido quedará con estado de pago <strong>pendiente</strong> hasta que el equipo verifique
          el voucher manualmente.
        </span>
      </div>
    </div>
  );
}
