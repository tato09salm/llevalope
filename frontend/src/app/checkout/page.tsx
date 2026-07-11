'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { pedidosAPI, usuariosAPI } from '../../lib/api';
import { calcularResumenLocal, TipoEnvio } from '../../lib/commerce';
import { guardarCheckoutPendiente, MetodoPagoUI } from '../../lib/pagos';
import SelectorMetodoPago from '../../components/checkout/pagos/SelectorMetodoPago';
import { useAuthStore } from '../../store/auth.store';
import { useCarritoStore } from '../../store/carrito.store';
import { CheckoutPreview, DireccionUsuario } from '../../types';

const DIRECCION_INICIAL = {
  alias: 'Casa',
  nombreCompleto: '',
  telefono: '',
  departamento: 'La Libertad',
  provincia: 'Trujillo',
  distrito: '',
  direccion: '',
  referencia: '',
  predeterminada: false,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const { items } = useCarritoStore();
  const [direcciones, setDirecciones] = useState<DireccionUsuario[]>([]);
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>('STANDARD');
  const [metodoPago, setMetodoPago] = useState<MetodoPagoUI>('YAPE');
  const [cupon, setCupon] = useState('');
  const [notas, setNotas] = useState('');
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [mostrarNuevaDireccion, setMostrarNuevaDireccion] = useState(false);
  const [nuevaDireccion, setNuevaDireccion] = useState(DIRECCION_INICIAL);

  const itemsPayload = useMemo(
    () => items.map((item) => ({ varianteId: item.variante.id, cantidad: item.cantidad })),
    [items],
  );

  const resumenLocal = useMemo(() => calcularResumenLocal(items, tipoEnvio), [items, tipoEnvio]);
  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  useEffect(() => {
    if (!usuario) return;
    cargarDirecciones();
  }, [usuario]);

  useEffect(() => {
    if (!usuario || items.length === 0) return;
    cargarPreview(true);
  }, [usuario, itemsPayload, tipoEnvio]);

  const cargarDirecciones = async () => {
    try {
      const resp: any = await usuariosAPI.listarDirecciones();
      const lista = Array.isArray(resp) ? resp : [];
      setDirecciones(lista);
      const preferida = lista.find((dir) => dir.predeterminada) || lista[0];
      if (preferida) {
        setDireccionId(preferida.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar las direcciones');
    }
  };

  const cargarPreview = async (reservarStock = false) => {
    if (itemsPayload.length === 0) return;

    setCargandoPreview(true);
    try {
      const resp: CheckoutPreview = await pedidosAPI.previewCheckout({
        items: itemsPayload,
        direccionId: direccionId || undefined,
        cupon: cupon.trim() || undefined,
        tipoEnvio,
        reservarStock,
      });
      setPreview(resp);
    } catch (error: any) {
      setPreview(null);
      toast.error(error.message || 'No se pudo validar el checkout');
    } finally {
      setCargandoPreview(false);
    }
  };

  const aplicarCupon = async () => {
    await cargarPreview(true);
    if (preview?.cupon || cupon.trim()) {
      toast.success('Resumen actualizado con el cupon');
    }
  };

  const guardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const creada: DireccionUsuario = await usuariosAPI.crearDireccion({
        ...nuevaDireccion,
        predeterminada: direcciones.length === 0 ? true : nuevaDireccion.predeterminada,
      });
      const nuevas = [...direcciones, creada];
      setDirecciones(nuevas);
      setDireccionId(creada.id);
      setMostrarNuevaDireccion(false);
      setNuevaDireccion(DIRECCION_INICIAL);
      toast.success('Direccion guardada');
      await cargarPreview(true);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la direccion');
    }
  };

  const continuarAlPago = async () => {
    if (!usuario) {
      router.push('/auth/iniciar-sesion');
      return;
    }
    if (!direccionId) {
      toast.error('Selecciona una direccion de envio');
      return;
    }
    if (!preview?.checkoutToken) {
      toast.error('Vuelve a validar el checkout para reservar stock');
      await cargarPreview(true);
      return;
    }

    setConfirmando(true);
    try {
      const direccionSeleccionada = direcciones.find((dir) => dir.id === direccionId);

      guardarCheckoutPendiente({
        itemsPayload,
        direccionId,
        direccion: direccionSeleccionada,
        tipoEnvio,
        cupon: cupon.trim() || undefined,
        notas: notas.trim() || undefined,
        checkoutToken: preview.checkoutToken,
        metodoPago,
        total: resumen.total,
        resumenItems: items.map((item) => ({
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          sku: item.variante.sku,
        })),
        creadoEn: new Date().toISOString(),
      });

      router.push('/checkout/pago');
    } finally {
      setConfirmando(false);
    }
  };

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Inicia sesion para continuar</h1>
          <p className="text-gris-elegante mb-6">
            El checkout persistente necesita una cuenta para guardar carrito, direcciones y pedidos.
          </p>
          <Link href="/auth/iniciar-sesion" className="btn-primario inline-block">
            Ir a iniciar sesion
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Tu carrito esta vacio</h1>
          <p className="text-gris-elegante mb-6">Agrega productos antes de iniciar el checkout.</p>
          <Link href="/productos" className="btn-primario inline-block">
            Explorar productos
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const resumen = preview?.resumen || resumenLocal;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <PackageCheck className="text-teal" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-azul-oscuro">Checkout</h1>
            <p className="text-gris-elegante text-sm">
              Confirma tu pedido con stock reservado temporalmente.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-azul-oscuro flex items-center gap-2">
                  <MapPin size={18} className="text-dorado" /> Direccion de envio
                </h2>
                <button
                  type="button"
                  onClick={() => setMostrarNuevaDireccion((prev) => !prev)}
                  className="text-sm text-teal font-semibold"
                >
                  {mostrarNuevaDireccion ? 'Cerrar formulario' : 'Nueva direccion'}
                </button>
              </div>

              {direcciones.length > 0 && (
                <div className="space-y-3 mb-4">
                  {direcciones.map((dir) => (
                    <label
                      key={dir.id}
                      className={`block border rounded-xl p-4 cursor-pointer transition-colors ${
                        direccionId === dir.id ? 'border-teal bg-teal/5' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={direccionId === dir.id}
                          onChange={() => {
                            setDireccionId(dir.id);
                            setTimeout(() => {
                              cargarPreview(true).catch(() => undefined);
                            }, 0);
                          }}
                        />
                        <div>
                          <p className="font-semibold text-azul-oscuro">
                            {dir.alias} {dir.predeterminada ? '(Predeterminada)' : ''}
                          </p>
                          <p className="text-sm text-gris-elegante">
                            {dir.nombreCompleto} - {dir.telefono}
                          </p>
                          <p className="text-sm text-gris-elegante">
                            {dir.direccion}, {dir.distrito}, {dir.provincia}, {dir.departamento}
                          </p>
                          {dir.referencia && (
                            <p className="text-xs text-gris-elegante mt-1">Referencia: {dir.referencia}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {(direcciones.length === 0 || mostrarNuevaDireccion) && (
                <form onSubmit={guardarDireccion} className="grid md:grid-cols-2 gap-4">
                  {Object.entries(nuevaDireccion).map(([key, value]) => {
                    if (key === 'predeterminada') return null;
                    return (
                      <input
                        key={key}
                        value={String(value)}
                        onChange={(e) =>
                          setNuevaDireccion((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder={key}
                        className="input-campo"
                        required={key !== 'referencia'}
                      />
                    );
                  })}
                  <label className="md:col-span-2 flex items-center gap-2 text-sm text-gris-elegante">
                    <input
                      type="checkbox"
                      checked={nuevaDireccion.predeterminada}
                      onChange={(e) =>
                        setNuevaDireccion((prev) => ({ ...prev, predeterminada: e.target.checked }))
                      }
                    />
                    Marcar como direccion predeterminada
                  </label>
                  <div className="md:col-span-2">
                    <button type="submit" className="btn-primario">
                      Guardar direccion
                    </button>
                  </div>
                </form>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-azul-oscuro mb-4 flex items-center gap-2">
                <Truck size={18} className="text-dorado" /> Tipo de envio
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <label className={`border rounded-xl p-4 cursor-pointer ${tipoEnvio === 'STANDARD' ? 'border-teal bg-teal/5' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    checked={tipoEnvio === 'STANDARD'}
                    onChange={() => setTipoEnvio('STANDARD')}
                  />
                  <div className="mt-2">
                    <p className="font-semibold text-azul-oscuro">Envio estandar</p>
                    <p className="text-sm text-gris-elegante">
                      Gratis desde S/ 199. Debajo del umbral se cobra segun resumen.
                    </p>
                  </div>
                </label>
                <label className={`border rounded-xl p-4 cursor-pointer ${tipoEnvio === 'EXPRESS' ? 'border-teal bg-teal/5' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    checked={tipoEnvio === 'EXPRESS'}
                    onChange={() => setTipoEnvio('EXPRESS')}
                  />
                  <div className="mt-2">
                    <p className="font-semibold text-azul-oscuro">Envio express</p>
                    <p className="text-sm text-gris-elegante">
                      Entrega prioritaria con costo adicional.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-azul-oscuro mb-4">Metodo de pago</h2>
              <p className="text-sm text-gris-elegante mb-4">
                Elige como quieres pagar. En el siguiente paso completaras el pago simulado.
              </p>
              <SelectorMetodoPago valor={metodoPago} onCambiar={setMetodoPago} />
            </section>

            <section className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-azul-oscuro mb-4">Cupon y notas</h2>
              <div className="flex gap-3 mb-4">
                <input
                  value={cupon}
                  onChange={(e) => setCupon(e.target.value.toUpperCase())}
                  placeholder="Ingresa tu cupon"
                  className="input-campo flex-1"
                />
                <button type="button" onClick={aplicarCupon} className="btn-secundario">
                  Validar
                </button>
              </div>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas para el pedido o la entrega"
                className="input-campo min-h-[120px]"
              />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-azul-oscuro mb-4">Resumen del pedido</h2>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gris-elegante">Subtotal</span>
                  <span>{formatPrecio(resumen.subtotalOriginal)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Descuento volumen</span>
                  <span>-{formatPrecio(resumen.descuentoVolumen)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Descuento cupon</span>
                  <span>-{formatPrecio(resumen.descuentoCupon)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gris-elegante">Envio</span>
                  <span>{resumen.costoEnvio === 0 ? 'GRATIS' : formatPrecio(resumen.costoEnvio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gris-elegante">IGV incluido</span>
                  <span>{formatPrecio(resumen.igvIncluido)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gris-elegante">Ahorro total</span>
                  <span className="text-green-700 font-semibold">{formatPrecio(resumen.ahorroTotal)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-azul-oscuro">
                  <span>Total</span>
                  <span>{formatPrecio(resumen.total)}</span>
                </div>
              </div>

              {preview?.reservaExpiraEn && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-4">
                  Stock reservado hasta: {new Date(preview.reservaExpiraEn).toLocaleString('es-PE')}
                </div>
              )}

              {resumen.faltanteEnvioGratis > 0 && tipoEnvio === 'STANDARD' && (
                <div className="bg-dorado/10 border border-dorado/30 rounded-xl p-3 text-xs text-azul-oscuro mb-4">
                  Agrega {formatPrecio(resumen.faltanteEnvioGratis)} mas para envio gratis.
                </div>
              )}

              <button
                type="button"
                onClick={continuarAlPago}
                disabled={confirmando || cargandoPreview}
                className="btn-primario w-full flex items-center justify-center gap-2"
              >
                {confirmando || cargandoPreview ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Continuar al pago'
                )}
              </button>

              <button
                type="button"
                onClick={() => cargarPreview(true)}
                className="btn-secundario w-full mt-3"
              >
                Revalidar stock y promociones
              </button>

              <div className="mt-4 text-xs text-gris-elegante flex items-start gap-2">
                <ShieldCheck size={16} className="mt-0.5 text-teal" />
                <span>
                  El backend vuelve a validar stock, cupones, descuentos y direccion antes de crear el pedido.
                </span>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-bold text-azul-oscuro mb-3">Items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.variante.id} className="flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-azul-oscuro">{item.producto.nombre}</p>
                      <p className="text-gris-elegante">
                        SKU {item.variante.sku} x {item.cantidad}
                      </p>
                    </div>
                    <span className="font-semibold text-azul-oscuro">
                      {formatPrecio(item.cantidad * Number(item.variante.enOferta && item.variante.precioOferta ? item.variante.precioOferta : item.variante.precioBase))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
