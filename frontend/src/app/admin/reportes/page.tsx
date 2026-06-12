'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Package, Users, DollarSign, Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { reportesAPI } from '../../../lib/api';

const extraerMensajeError = (error: any, fallback: string) => {
  if (!error) return fallback;
  if (typeof error.message === 'string') return error.message;
  if (Array.isArray(error.message)) return error.message.join(', ');
  return fallback;
};

const validarBlobPDF = async (blob: Blob) => {
  if (!blob || blob.size === 0) {
    throw new Error('El archivo PDF está vacío');
  }

  const inicio = await blob.slice(0, 5).text();
  if (!inicio.startsWith('%PDF')) {
    throw new Error('La respuesta del servidor no es un PDF válido');
  }
};

// Helper para descargar archivos
const descargarArchivo = (blob: Blob, nombre: string, tipo?: string) => {
  const archivo = tipo ? new Blob([blob], { type: tipo }) : blob;
  const url = window.URL.createObjectURL(archivo);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export default function AdminReportesPage() {
  const [metricas, setMetricas] = useState<any>(null);
  const [ventasPorDia, setVentasPorDia] = useState<any[]>([]);
  const [masVendidos, setMasVendidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dashboardResp, ventasResp, masVendidosResp] = await Promise.all([
        reportesAPI.dashboard(),
        reportesAPI.ventasPorDia(),
        reportesAPI.masVendidos(),
      ]);
      setMetricas(dashboardResp);
      setVentasPorDia(Array.isArray(ventasResp) ? ventasResp : []);
      setMasVendidos(Array.isArray(masVendidosResp) ? masVendidosResp : []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar los reportes');
    } finally {
      setCargando(false);
    }
  };

  // Funciones de descarga PDF
  const descargarPDF = async (
    descargarFn: () => Promise<{ data: Blob }>,
    nombreArchivo: string,
    etiqueta: string,
    clave: string,
  ) => {
    setDescargando(clave);
    try {
      const resp = await descargarFn();
      await validarBlobPDF(resp.data);
      descargarArchivo(resp.data, nombreArchivo, 'application/pdf');
      toast.success(`Reporte de ${etiqueta} descargado`);
    } catch (error: any) {
      toast.error(extraerMensajeError(error, `Error al descargar el PDF de ${etiqueta}`));
    } finally {
      setDescargando(null);
    }
  };

  const descargarPDFVentas = () =>
    descargarPDF(reportesAPI.descargarPDFVentas, 'reporte-ventas.pdf', 'ventas', 'pdf-ventas');

  const descargarPDFProductos = () =>
    descargarPDF(reportesAPI.descargarPDFProductos, 'reporte-productos.pdf', 'productos', 'pdf-productos');

  const descargarPDFPedidos = () =>
    descargarPDF(reportesAPI.descargarPDFPedidos, 'reporte-pedidos.pdf', 'pedidos', 'pdf-pedidos');

  // Funciones de descarga CSV
  const descargarCSVVentas = async () => {
    setDescargando('csv-ventas');
    try {
      const resp = await reportesAPI.descargarCSVVentas();
      descargarArchivo(resp.data, 'reporte-ventas.csv');
      toast.success('Reporte de ventas CSV descargado');
    } catch (error: any) {
      toast.error('Error al descargar el CSV de ventas');
    } finally {
      setDescargando(null);
    }
  };

  const descargarCSVProductos = async () => {
    setDescargando('csv-productos');
    try {
      const resp = await reportesAPI.descargarCSVProductos();
      descargarArchivo(resp.data, 'reporte-productos.csv');
      toast.success('Reporte de productos CSV descargado');
    } catch (error: any) {
      toast.error('Error al descargar el CSV de productos');
    } finally {
      setDescargando(null);
    }
  };

  const descargarCSVPedidos = async () => {
    setDescargando('csv-pedidos');
    try {
      const resp = await reportesAPI.descargarCSVPedidos();
      descargarArchivo(resp.data, 'reporte-pedidos.csv');
      toast.success('Reporte de pedidos CSV descargado');
    } catch (error: any) {
      toast.error('Error al descargar el CSV de pedidos');
    } finally {
      setDescargando(null);
    }
  };

  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

  const getPrecioProducto = (producto: any) => {
    if (producto.variantes && producto.variantes.length > 0) {
      return producto.variantes[0].precioOferta || producto.variantes[0].precioBase || 0;
    }
    return 0;
  };

  return (
    <AdminShell
      title="Reportes y Estadísticas"
      description="Analiza el rendimiento de la tienda con métricas clave"
      icon={BarChart3}
    >
      {cargando ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tarjetas de métricas */}
          {metricas && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-azul-oscuro">{formatPrecio(metricas.ventasMes)}</p>
                <p className="text-sm text-gris-elegante mt-1">Ventas del mes</p>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-white" />
                  </div>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-azul-oscuro">{metricas.pedidosMes}</p>
                <p className="text-sm text-gris-elegante mt-1">Pedidos del mes</p>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-azul-corp rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-azul-oscuro">{metricas.totalUsuarios?.toLocaleString()}</p>
                <p className="text-sm text-gris-elegante mt-1">Clientes totales</p>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-azul-oscuro">{metricas.productosStockBajo}</p>
                <p className="text-sm text-gris-elegante mt-1">Productos con stock bajo</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ventas por día */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-azul-oscuro flex items-center gap-2">
                  <Calendar size={18} className="text-teal" /> Ventas por día
                </h2>
              </div>
              <div className="space-y-3">
                {ventasPorDia.length === 0 ? (
                  <div className="text-center py-8 text-gris-elegante">
                    No hay datos de ventas para mostrar
                  </div>
                ) : (
                  ventasPorDia.slice(0, 10).map((venta, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gris-elegante">
                        {formatFecha(venta.fecha)}
                      </div>
                      <div className="flex-1 h-8 bg-crema rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal to-azul-corp"
                          style={{
                            width: `${Math.min(
                              (venta.total / (ventasPorDia[0]?.total || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="w-32 text-right text-sm font-semibold text-azul-oscuro">
                        {formatPrecio(venta.total)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Productos más vendidos */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-azul-oscuro flex items-center gap-2">
                  <Package size={18} className="text-teal" /> Productos más vendidos
                </h2>
              </div>
              <div className="space-y-4">
                {masVendidos.length === 0 ? (
                  <div className="text-center py-8 text-gris-elegante">
                    No hay datos de productos vendidos
                  </div>
                ) : (
                  masVendidos.slice(0, 8).map((producto, index) => (
                    <div key={producto.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-teal text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-azul-oscuro truncate">
                          {producto.nombre}
                        </p>
                        <p className="text-xs text-gris-elegante">
                          {producto.totalVentas} ventas | {formatPrecio(getPrecioProducto(producto))}
                        </p>
                      </div>
                      <div className="w-20 h-2 bg-crema rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal"
                          style={{
                            width: `${Math.min(
                              (producto.totalVentas / (masVendidos[0]?.totalVentas || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-bold text-azul-oscuro mb-4">Exportar datos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium text-azul-oscuro text-sm">Formatos PDF</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={descargarPDFVentas}
                    disabled={descargando !== null}
                    className="btn-primario inline-flex items-center gap-2"
                  >
                    {descargando === 'pdf-ventas' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {descargando === 'pdf-ventas' ? 'Descargando...' : 'Ventas (PDF)'}
                  </button>
                  <button
                    onClick={descargarPDFProductos}
                    disabled={descargando !== null}
                    className="btn-primario inline-flex items-center gap-2"
                  >
                    {descargando === 'pdf-productos' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {descargando === 'pdf-productos' ? 'Descargando...' : 'Productos (PDF)'}
                  </button>
                  <button
                    onClick={descargarPDFPedidos}
                    disabled={descargando !== null}
                    className="btn-primario inline-flex items-center gap-2"
                  >
                    {descargando === 'pdf-pedidos' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {descargando === 'pdf-pedidos' ? 'Descargando...' : 'Pedidos (PDF)'}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-azul-oscuro text-sm">Formatos CSV</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={descargarCSVVentas}
                    disabled={descargando !== null}
                    className="btn-secundario inline-flex items-center gap-2"
                  >
                    {descargando === 'csv-ventas' ? (
                      <div className="w-4 h-4 border-2 border-azul-oscuro border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {descargando === 'csv-ventas' ? 'Descargando...' : 'Ventas (CSV)'}
                  </button>
                  <button
                    onClick={descargarCSVProductos}
                    disabled={descargando !== null}
                    className="btn-secundario inline-flex items-center gap-2"
                  >
                    {descargando === 'csv-productos' ? (
                      <div className="w-4 h-4 border-2 border-azul-oscuro border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {descargando === 'csv-productos' ? 'Descargando...' : 'Productos (CSV)'}
                  </button>
                  <button
                    onClick={descargarCSVPedidos}
                    disabled={descargando !== null}
                    className="btn-secundario inline-flex items-center gap-2"
                  >
                    {descargando === 'csv-pedidos' ? (
                      <div className="w-4 h-4 border-2 border-azul-oscuro border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {descargando === 'csv-pedidos' ? 'Descargando...' : 'Pedidos (CSV)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
