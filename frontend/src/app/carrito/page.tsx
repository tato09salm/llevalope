'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useCarritoStore } from '../../store/carrito.store';
import { calcularResumenLocal } from '../../lib/commerce';

export default function CarritoPage() {
  const { items, subtotal, actualizarCantidad, quitar, vaciar } = useCarritoStore();
  const [procesando, setProcesando] = useState<number | null>(null);

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(p);

  const resumen = calcularResumenLocal(items);

  const cambiarCantidad = async (varianteId: number, cantidad: number) => {
    setProcesando(varianteId);
    try {
      await actualizarCantidad(varianteId, cantidad);
    } finally {
      setProcesando(null);
    }
  };

  const eliminarItem = async (varianteId: number) => {
    setProcesando(varianteId);
    try {
      await quitar(varianteId);
    } finally {
      setProcesando(null);
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
              {items.map(({ producto, variante, cantidad }) => (
                <motion.div
                  key={variante.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-white rounded-2xl shadow-card p-4 flex gap-4"
                >
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-crema rounded-xl overflow-hidden shrink-0">
                    {variante.imagenes?.[0]?.url || producto.imagenPrincipal ? (
                      <Image src={variante.imagenes?.[0]?.url || producto.imagenPrincipal || ''} alt={producto.nombre} width={96} height={96} className="w-full h-full object-cover" />
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
                    <p className="text-xs text-gris-elegante">SKU: {variante.sku}</p>
                    {(variante.color || variante.size) && (
                      <p className="text-xs text-gris-elegante">
                        {variante.color?.nombre} {variante.color && variante.size && '|'} {variante.size?.nombre}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      {/* Cantidad */}
                      <div className="flex items-center gap-2 bg-crema rounded-lg p-1">
                        <button
                          onClick={() => cambiarCantidad(variante.id, cantidad - 1)}
                          disabled={procesando === variante.id}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-azul-oscuro">
                          {cantidad}
                        </span>
                        <button
                          onClick={() => cambiarCantidad(variante.id, cantidad + 1)}
                          disabled={cantidad >= variante.stock || procesando === variante.id}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Precio y eliminar */}
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-azul-oscuro">
                          {formatPrecio(Number(variante.enOferta && variante.precioOferta ? variante.precioOferta : variante.precioBase) * cantidad)}
                        </p>
                        <button
                          onClick={() => eliminarItem(variante.id)}
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

            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-semibold text-azul-oscuro mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-dorado" /> Beneficios del checkout
              </h3>
              <div className="space-y-2 text-sm text-gris-elegante">
                <p>Envio gratis en compras desde {formatPrecio(resumen.umbralEnvioGratis)}.</p>
                <p>IGV incluido en los precios mostrados.</p>
                <p>5% de descuento por volumen al llevar 3 o mas unidades de la misma variante.</p>
                <p>Cupones y envio express se validan en el checkout antes de confirmar.</p>
              </div>
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
                  <span className="text-gris-elegante">Subtotal productos</span>
                  <span className="font-medium">{formatPrecio(resumen.subtotalOriginal)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-700">
                  <span>Descuento por volumen</span>
                  <span>-{formatPrecio(resumen.descuentoVolumen)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gris-elegante flex items-center gap-1">
                    <Truck size={14} /> Envío
                  </span>
                  <span className={resumen.costoEnvio === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {resumen.costoEnvio === 0 ? 'GRATIS' : formatPrecio(resumen.costoEnvio)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gris-elegante">IGV incluido (18%)</span>
                  <span className="font-medium">{formatPrecio(resumen.igvIncluido)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gris-elegante">Ahorro acumulado</span>
                  <span className="font-medium text-green-700">{formatPrecio(resumen.ahorroTotal)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-azul-oscuro">Total</span>
                    <span className="font-bold text-xl text-azul-oscuro">{formatPrecio(resumen.total)}</span>
                  </div>
                </div>
              </div>

              {resumen.faltanteEnvioGratis > 0 && (
                <div className="bg-dorado bg-opacity-10 border border-dorado border-opacity-30 rounded-xl p-3 mb-5">
                  <p className="text-xs text-azul-oscuro">
                    Agrega <strong>{formatPrecio(resumen.faltanteEnvioGratis)}</strong> mas para envio gratis
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
