'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import SelectorMetodoPago from '../../../components/checkout/pagos/SelectorMetodoPago';
import PagoYape from '../../../components/checkout/pagos/PagoYape';
import PagoPlin from '../../../components/checkout/pagos/PagoPlin';
import PagoBilleteraBase from '../../../components/checkout/pagos/PagoBilleteraBase';
import PagoTarjeta from '../../../components/checkout/pagos/PagoTarjeta';
import PagoTransferencia from '../../../components/checkout/pagos/PagoTransferencia';
import PagoPaypal from '../../../components/checkout/pagos/PagoPaypal';
import PagoMercadoPago from '../../../components/checkout/pagos/PagoMercadoPago';
import PagoContraEntrega from '../../../components/checkout/pagos/PagoContraEntrega';
import PagoEfectivo from '../../../components/checkout/pagos/PagoEfectivo';
import { pedidosAPI } from '../../../lib/api';
import {
  CheckoutPendiente,
  MetodoPagoUI,
  guardarDatosPagoLocal,
  limpiarCheckoutPendiente,
  obtenerCheckoutPendiente,
  obtenerDefinicionMetodo,
} from '../../../lib/pagos';
import { useAuthStore } from '../../../store/auth.store';
import { useCarritoStore } from '../../../store/carrito.store';

interface DatosPagoResultado {
  numeroOperacion?: string;
  ultimos4?: string;
  voucherNombre?: string;
  cip?: string;
  cuotas?: number;
}

export default function PagoCheckoutPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const { vaciar } = useCarritoStore();
  const [pendiente, setPendiente] = useState<CheckoutPendiente | null | undefined>(undefined);
  const [metodoActivo, setMetodoActivo] = useState<MetodoPagoUI | null>(null);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    const datos = obtenerCheckoutPendiente();
    setPendiente(datos);
    if (datos) setMetodoActivo(datos.metodoPago);
  }, []);

  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  const crearPedidoConPago = async (resultado: DatosPagoResultado) => {
    if (!pendiente || !metodoActivo) return;
    const definicion = obtenerDefinicionMetodo(metodoActivo);

    setCreando(true);
    try {
      const notasPago = [
        pendiente.notas,
        `Pago simulado (${definicion.label})${resultado.numeroOperacion ? ` - Operación: ${resultado.numeroOperacion}` : ''}${
          resultado.voucherNombre ? ` - Voucher: ${resultado.voucherNombre}` : ''
        }${resultado.cip ? ` - CIP: ${resultado.cip}` : ''}`,
      ]
        .filter(Boolean)
        .join(' | ');

      const pedido: any = await pedidosAPI.crear({
        items: pendiente.itemsPayload,
        direccionId: pendiente.direccionId,
        metodoPago: definicion.metodoBackend,
        cupon: pendiente.cupon,
        tipoEnvio: pendiente.tipoEnvio,
        checkoutToken: pendiente.checkoutToken,
        notas: notasPago || undefined,
        datosPago: {
          numeroOperacion: resultado.numeroOperacion,
          ultimos4: resultado.ultimos4,
          voucher: resultado.voucherNombre,
        },
      });

      guardarDatosPagoLocal(String(pedido.id), {
        metodo: metodoActivo,
        numeroOperacion: resultado.numeroOperacion,
        voucherNombre: resultado.voucherNombre,
        ultimos4: resultado.ultimos4,
        cip: resultado.cip,
        timestamp: new Date().toISOString(),
      });

      limpiarCheckoutPendiente();
      await vaciar();
      toast.success('Pedido creado correctamente');
      router.push(`/checkout/exito/${pedido.id}`);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo crear el pedido');
      setCreando(false);
    }
  };

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Inicia sesion para continuar</h1>
          <Link href="/auth/iniciar-sesion" className="btn-primario inline-block">
            Ir a iniciar sesion
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (pendiente === undefined) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gris-elegante">Cargando...</div>
        <Footer />
      </>
    );
  }

  if (!pendiente) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-azul-oscuro mb-3">
            No encontramos un checkout en curso
          </h1>
          <p className="text-gris-elegante mb-6">
            Vuelve al checkout para revisar tu direccion y tu resumen antes de pagar.
          </p>
          <Link href="/checkout" className="btn-primario inline-block">
            Ir al checkout
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const renderComponentePago = () => {
    if (!metodoActivo) return null;
    const onCancelar = () => setMetodoActivo(null);

    switch (metodoActivo) {
      case 'YAPE':
        return <PagoYape monto={pendiente.total} onExito={crearPedidoConPago} onCancelar={onCancelar} />;
      case 'PLIN':
        return <PagoPlin monto={pendiente.total} onExito={crearPedidoConPago} onCancelar={onCancelar} />;
      case 'QR_UNIFICADO':
        return (
          <PagoBilleteraBase
            metodo="QR_UNIFICADO"
            monto={pendiente.total}
            numeroDestino="Escanea con Yape o Plin"
            colorPrincipal="#1B263B"
            onExito={crearPedidoConPago}
            onCancelar={onCancelar}
          />
        );
      case 'BIM':
        return (
          <PagoBilleteraBase
            metodo="BIM"
            monto={pendiente.total}
            numeroDestino="945 123 456"
            colorPrincipal="#E30613"
            onExito={crearPedidoConPago}
            onCancelar={onCancelar}
          />
        );
      case 'LUKITA':
        return (
          <PagoBilleteraBase
            metodo="LUKITA"
            monto={pendiente.total}
            numeroDestino="978 222 111"
            colorPrincipal="#FF6B00"
            onExito={crearPedidoConPago}
            onCancelar={onCancelar}
          />
        );
      case 'TARJETA':
        return (
          <PagoTarjeta monto={pendiente.total} onExito={crearPedidoConPago} onCancelar={onCancelar} />
        );
      case 'TRANSFERENCIA':
        return (
          <PagoTransferencia
            monto={pendiente.total}
            onExito={crearPedidoConPago}
            onCancelar={onCancelar}
          />
        );
      case 'PAGOEFECTIVO':
        return (
          <PagoEfectivo monto={pendiente.total} onExito={crearPedidoConPago} onCancelar={onCancelar} />
        );
      case 'PAYPAL':
        return (
          <PagoPaypal monto={pendiente.total} onExito={crearPedidoConPago} onCancelar={onCancelar} />
        );
      case 'MERCADOPAGO':
        return (
          <PagoMercadoPago
            monto={pendiente.total}
            onExito={crearPedidoConPago}
            onCancelar={onCancelar}
          />
        );
      case 'CONTRA_ENTREGA':
        return (
          <PagoContraEntrega
            monto={pendiente.total}
            direccion={pendiente.direccion as any}
            onExito={() => crearPedidoConPago({})}
            onCancelar={onCancelar}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => router.push('/checkout')}
          className="flex items-center gap-2 text-sm text-teal font-semibold mb-6"
        >
          <ArrowLeft size={16} /> Volver al checkout
        </button>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-azul-oscuro">Completa tu pago</h1>
            <p className="text-sm text-gris-elegante">Simulación de pago, sin cargos reales</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gris-elegante">Total a pagar</p>
            <p className="text-xl font-bold text-azul-oscuro">{formatPrecio(pendiente.total)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          {creando ? (
            <div className="text-center py-16">
              <p className="text-gris-elegante">Creando tu pedido...</p>
            </div>
          ) : metodoActivo ? (
            renderComponentePago()
          ) : (
            <div>
              <h2 className="font-bold text-azul-oscuro mb-4">Elige un método de pago</h2>
              <SelectorMetodoPago valor={pendiente.metodoPago} onCambiar={setMetodoActivo} />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-gris-elegante">
          <ShieldCheck size={14} className="mt-0.5 text-teal shrink-0" />
          <span>
            El backend vuelve a validar stock y direccion antes de confirmar el pedido con el metodo
            de pago elegido.
          </span>
        </div>
      </div>
      <Footer />
    </>
  );
}
