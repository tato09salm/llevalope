'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Truck } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useCarritoStore } from '../../store/carrito.store';

export default function CarritoPage() {
  const { items, subtotal, actualizarCantidad, quitar, vaciar } = useCarritoStore();
  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(p);

  const costoEnvio = subtotal >= 149 ? 0 : 10;
  const igv = subtotal * 0.18;
  const total = subtotal + costoEnvio + igv - descuento;

  const aplicarCupon = () => {
    const cupones: Record<string, number> = {
      BIENVENIDO10: subtotal * 0.1,
      LLEVA20: 20,
      CYBER30: subtotal * 0.3,
    };
    const desc = cupones[cupon.toUpperCase()];
    if (desc) {
      setDescuento(desc);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-24 h-24 bg-crema rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gris-elegante" />
            </div>
            <h2 className="text-2xl font-bold text-azul-oscuro mb-3">Tu carrito está vacío</h2>
            <p className="text-gris-elegante mb-8">¡Descubre miles de productos increíbles que tenemos para ti!</p>
            <Link href="/productos" className="btn-primario inline-block">
              Explorar Productos
            </Link>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/productos" className="flex items-center gap-2 text-gris-elegante hover:text-teal transition-colors text-sm">
            <ArrowLeft size={16} /> Continuar comprando
          </Link>
          <h1 className="text-2xl font-bold font-montserrat text-azul-oscuro">
            Mi Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(({ producto, cantidad }) => (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-white rounded-2xl shadow-card p-4 flex gap-4"
                >
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-crema rounded-xl overflow-hidden shrink-0">
                    {producto.imagenPrincipal ? (
                      <Image src={producto.imagenPrincipal} alt={producto.nombre} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={30} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-teal font-medium mb-0.5">
                      {producto.categoria?.nombre}
                    </p>
                    <h3 className="font-semibold text-azul-oscuro text-sm line-clamp-2 mb-2">
                      {producto.nombre}
                    </h3>
                    <p className="text-xs text-gris-elegante">SKU: {producto.sku}</p>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      {/* Cantidad */}
                      <div className="flex items-center gap-2 bg-crema rounded-lg p-1">
                        <button
                          onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-azul-oscuro">
                          {cantidad}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                          disabled={cantidad >= producto.stock}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Precio y eliminar */}
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-azul-oscuro">
                          {formatPrecio(Number(producto.precio) * cantidad)}
                        </p>
                        <button
                          onClick={() => quitar(producto.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cupón */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-semibold text-azul-oscuro mb-3 flex items-center gap-2">
                <Tag size={16} className="text-dorado" /> Código de Descuento
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={cupon}
                  onChange={(e) => setCupon(e.target.value.toUpperCase())}
                  placeholder="Ej: BIENVENIDO10"
                  className="input-campo flex-1"
                />
                <button onClick={aplicarCupon} className="btn-secundario px-6">
                  Aplicar
                </button>
              </div>
              {descuento > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-sm mt-2 font-medium">
                  ✅ Descuento aplicado: {formatPrecio(descuento)}
                </motion.p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h3 className="font-bold font-montserrat text-azul-oscuro text-lg mb-5">
                Resumen del Pedido
              </h3>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gris-elegante">Subtotal</span>
                  <span className="font-medium">{formatPrecio(subtotal)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento (cupón)</span>
                    <span>-{formatPrecio(descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gris-elegante flex items-center gap-1">
                    <Truck size={14} /> Envío
                  </span>
                  <span className={costoEnvio === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {costoEnvio === 0 ? 'GRATIS' : formatPrecio(costoEnvio)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gris-elegante">IGV (18%)</span>
                  <span className="font-medium">{formatPrecio(igv)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-azul-oscuro">Total</span>
                    <span className="font-bold text-xl text-azul-oscuro">{formatPrecio(total)}</span>
                  </div>
                </div>
              </div>

              {costoEnvio > 0 && (
                <div className="bg-dorado bg-opacity-10 border border-dorado border-opacity-30 rounded-xl p-3 mb-5">
                  <p className="text-xs text-azul-oscuro">
                    💡 Agrega <strong>{formatPrecio(149 - subtotal)}</strong> más para envío gratis
                  </p>
                </div>
              )}

              <Link
                href="/checkout"
                className="btn-primario w-full text-center block text-base"
              >
                Proceder al Checkout →
              </Link>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gris-elegante">
                <span>🔒</span>
                <span>Pago 100% seguro y encriptado</span>
              </div>

              {/* Métodos de pago */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['Visa', 'MC', 'Yape', 'Plin', 'PayPal'].map((p) => (
                  <span key={p} className="bg-crema text-xs px-2.5 py-1 rounded border border-gray-200 text-gris-elegante">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
