'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Boxes, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { inventarioAPI, productosAPI } from '../../../lib/api';
import { MovimientoInventario, Producto } from '../../../types';

const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION'] as const;

export default function AdminInventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<number | ''>('');
  const [cargando, setCargando] = useState(true);
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);
  const [form, setForm] = useState({
    varianteId: '',
    cantidad: 1,
    tipo: 'ENTRADA',
    motivo: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarMovimientos();
  }, [varianteSeleccionada]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [productosResp, movimientosResp] = await Promise.all([
        productosAPI.listarAdmin({ limite: 100 }),
        inventarioAPI.movimientos(),
      ]);
      setProductos(productosResp?.datos || []);
      setMovimientos(movimientosResp || []);

      const primeraVariante = (productosResp?.datos || []).flatMap((producto: Producto) => producto.variantes || [])[0];
      if (primeraVariante) {
        setVarianteSeleccionada(primeraVariante.id);
        setForm((prev) => ({ ...prev, varianteId: String(primeraVariante.id) }));
      }
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar el inventario');
    } finally {
      setCargando(false);
    }
  };

  const cargarMovimientos = async () => {
    try {
      const resp = await inventarioAPI.movimientos(varianteSeleccionada || undefined);
      setMovimientos(resp || []);
    } catch {
      setMovimientos([]);
    }
  };

  const todasLasVariantes = useMemo(
    () =>
      productos.flatMap((producto) =>
        (producto.variantes || []).map((variante) => ({
          ...variante,
          productoNombre: producto.nombre,
          categoria: producto.categoria?.nombre,
        })),
      ),
    [productos],
  );

  const productoRows = useMemo(
    () =>
      productos.map((producto) => {
        const stockTotal = (producto.variantes || []).reduce((acc, variante) => acc + variante.stock, 0);
        const stockMinimo = Math.min(...(producto.variantes || []).map((variante) => variante.stock));
        const stockBajo = (producto.variantes || []).some((variante) => variante.stock < 5);
        return { ...producto, stockTotal, stockMinimo, stockBajo };
      }),
    [productos],
  );

  const enviarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.varianteId || !form.motivo.trim()) {
      toast.error('Completa la variante y el motivo del ajuste');
      return;
    }

    setGuardandoAjuste(true);
    try {
      await inventarioAPI.ajustar({
        varianteId: Number(form.varianteId),
        cantidad: Number(form.cantidad),
        tipo: form.tipo,
        motivo: form.motivo.trim(),
      });
      toast.success('Stock ajustado correctamente');
      setForm((prev) => ({ ...prev, cantidad: 1, motivo: '' }));
      await Promise.all([cargarDatos(), cargarMovimientos()]);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo ajustar el stock');
    } finally {
      setGuardandoAjuste(false);
    }
  };

  return (
    <AdminShell
      title="Gestion de Inventario"
      description="Controla stock actual, identifica alertas y registra ajustes manuales con trazabilidad."
      icon={Boxes}
    >
      <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <section className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {cargando ? (
              <div className="flex justify-center py-20">
                <Loader2 size={36} className="animate-spin text-teal" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-crema border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Producto</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Categoria</th>
                      <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Variantes</th>
                      <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Stock actual</th>
                      <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {productoRows.map((producto) => (
                      <tr key={producto.id} className="hover:bg-crema transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-azul-oscuro">{producto.nombre}</td>
                        <td className="px-5 py-4 text-sm text-gris-elegante">{producto.categoria?.nombre || '-'}</td>
                        <td className="px-5 py-4 text-center text-sm text-azul-oscuro">
                          {producto.variantes?.length || 0}
                        </td>
                        <td className="px-5 py-4 text-center text-sm font-bold text-azul-oscuro">
                          {producto.stockTotal}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              producto.stockBajo ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {producto.stockBajo && <AlertTriangle size={12} />}
                            {producto.stockBajo ? 'Stock bajo' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-azul-oscuro">Historial de movimientos</h2>
              <select
                value={String(varianteSeleccionada)}
                onChange={(e) => setVarianteSeleccionada(e.target.value ? Number(e.target.value) : '')}
                className="input-campo max-w-sm"
              >
                <option value="">Todas las variantes</option>
                {todasLasVariantes.map((variante) => (
                  <option key={variante.id} value={variante.id}>
                    {variante.productoNombre} - {variante.sku}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {movimientos.length === 0 ? (
                <p className="text-sm text-gris-elegante">Aun no hay movimientos registrados.</p>
              ) : (
                movimientos.map((movimiento) => (
                  <div key={movimiento.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-azul-oscuro">
                          {movimiento.variante?.producto?.nombre || 'Producto'} - {movimiento.variante?.sku || '-'}
                        </p>
                        <p className="text-sm text-gris-elegante">{movimiento.motivo}</p>
                      </div>
                      <span className="text-sm font-semibold text-azul-oscuro">{movimiento.tipo}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                      <div className="bg-crema rounded-lg p-3">
                        <p className="text-gris-elegante">Cantidad</p>
                        <p className="font-bold text-azul-oscuro">{movimiento.cantidad}</p>
                      </div>
                      <div className="bg-crema rounded-lg p-3">
                        <p className="text-gris-elegante">Antes</p>
                        <p className="font-bold text-azul-oscuro">{movimiento.stockAnterior}</p>
                      </div>
                      <div className="bg-crema rounded-lg p-3">
                        <p className="text-gris-elegante">Despues</p>
                        <p className="font-bold text-azul-oscuro">{movimiento.stockNuevo}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gris-elegante mt-3">
                      {new Date(movimiento.creadoEn).toLocaleString('es-PE')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-azul-oscuro mb-4">Ajuste manual de stock</h2>
          <form onSubmit={enviarAjuste} className="space-y-4">
            <select
              value={form.varianteId}
              onChange={(e) => setForm((prev) => ({ ...prev, varianteId: e.target.value }))}
              className="input-campo"
              required
            >
              <option value="">Selecciona una variante</option>
              {todasLasVariantes.map((variante) => (
                <option key={variante.id} value={variante.id}>
                  {variante.productoNombre} - {variante.sku} | Stock {variante.stock}
                </option>
              ))}
            </select>

            <select
              value={form.tipo}
              onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
              className="input-campo"
            >
              {TIPOS_MOVIMIENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={form.cantidad}
              onChange={(e) => setForm((prev) => ({ ...prev, cantidad: Number(e.target.value) }))}
              className="input-campo"
              placeholder="Cantidad"
              required
            />

            <textarea
              value={form.motivo}
              onChange={(e) => setForm((prev) => ({ ...prev, motivo: e.target.value }))}
              className="input-campo min-h-[120px]"
              placeholder="Motivo del ajuste"
              required
            />

            <button disabled={guardandoAjuste} className="btn-primario w-full">
              {guardandoAjuste ? 'Guardando...' : 'Registrar ajuste'}
            </button>
          </form>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            Se resalta stock bajo cuando alguna variante del producto tiene menos de 5 unidades.
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
