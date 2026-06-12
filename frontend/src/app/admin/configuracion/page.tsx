'use client';

import { useState } from 'react';
import { Settings, Save, Bell, Lock, Globe, Truck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';

export default function AdminConfiguracionPage() {
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombreTienda: 'LlevaloPe',
    correoContacto: 'contacto@llevalope.pe',
    telefonoContacto: '+51 987 654 321',
    direccion: 'Av. Principal 123, Trujillo, Perú',
    costoEnvioEstandar: 15,
    costoEnvioExpress: 30,
    umbralEnvioGratis: 199,
    iva: 18,
    moneda: 'PEN',
    notificacionesEmail: true,
    notificacionesPush: false,
    modoMantenimiento: false,
  });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configuración guardada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AdminShell
      title="Configuración"
      description="Ajusta los parámetros generales de la tienda"
      icon={Settings}
    >
      <form onSubmit={guardar} className="space-y-6">
        {/* Información general */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-azul-oscuro mb-5 flex items-center gap-2">
            <Globe size={18} className="text-teal" /> Información general
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-campo">Nombre de la tienda</label>
              <input
                value={form.nombreTienda}
                onChange={(e) => setForm((prev) => ({ ...prev, nombreTienda: e.target.value }))}
                className="input-campo"
                required
              />
            </div>
            <div>
              <label className="label-campo">Correo de contacto</label>
              <input
                type="email"
                value={form.correoContacto}
                onChange={(e) => setForm((prev) => ({ ...prev, correoContacto: e.target.value }))}
                className="input-campo"
                required
              />
            </div>
            <div>
              <label className="label-campo">Teléfono de contacto</label>
              <input
                value={form.telefonoContacto}
                onChange={(e) => setForm((prev) => ({ ...prev, telefonoContacto: e.target.value }))}
                className="input-campo"
              />
            </div>
            <div>
              <label className="label-campo">Moneda</label>
              <select
                value={form.moneda}
                onChange={(e) => setForm((prev) => ({ ...prev, moneda: e.target.value }))}
                className="input-campo"
              >
                <option value="PEN">PEN (Soles)</option>
                <option value="USD">USD (Dólares)</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-campo">Dirección</label>
              <input
                value={form.direccion}
                onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))}
                className="input-campo"
              />
            </div>
          </div>
        </div>

        {/* Envíos */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-azul-oscuro mb-5 flex items-center gap-2">
            <Truck size={18} className="text-teal" /> Configuración de envíos
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label-campo">Costo envío estándar</label>
              <input
                type="number"
                value={form.costoEnvioEstandar}
                onChange={(e) => setForm((prev) => ({ ...prev, costoEnvioEstandar: Number(e.target.value) }))}
                className="input-campo"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="label-campo">Costo envío express</label>
              <input
                type="number"
                value={form.costoEnvioExpress}
                onChange={(e) => setForm((prev) => ({ ...prev, costoEnvioExpress: Number(e.target.value) }))}
                className="input-campo"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="label-campo">Umbral envío gratis</label>
              <input
                type="number"
                value={form.umbralEnvioGratis}
                onChange={(e) => setForm((prev) => ({ ...prev, umbralEnvioGratis: Number(e.target.value) }))}
                className="input-campo"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Impuestos y pagos */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-azul-oscuro mb-5 flex items-center gap-2">
            <CreditCard size={18} className="text-teal" /> Impuestos y pagos
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-campo">IVA (%)</label>
              <input
                type="number"
                value={form.iva}
                onChange={(e) => setForm((prev) => ({ ...prev, iva: Number(e.target.value) }))}
                className="input-campo"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-azul-oscuro mb-5 flex items-center gap-2">
            <Bell size={18} className="text-teal" /> Notificaciones
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notificacionesEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, notificacionesEmail: e.target.checked }))}
                className="w-4 h-4 text-teal"
              />
              <span className="text-sm text-azul-oscuro">Enviar notificaciones por correo electrónico</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notificacionesPush}
                onChange={(e) => setForm((prev) => ({ ...prev, notificacionesPush: e.target.checked }))}
                className="w-4 h-4 text-teal"
              />
              <span className="text-sm text-azul-oscuro">Habilitar notificaciones push</span>
            </label>
          </div>
        </div>

        {/* Mantenimiento */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-azul-oscuro mb-5 flex items-center gap-2">
            <Lock size={18} className="text-teal" /> Mantenimiento
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.modoMantenimiento}
                onChange={(e) => setForm((prev) => ({ ...prev, modoMantenimiento: e.target.checked }))}
                className="w-4 h-4 text-red-500"
              />
              <span className="text-sm text-azul-oscuro">Activar modo mantenimiento</span>
            </label>
            <p className="text-xs text-gris-elegante">
              Al activar el modo mantenimiento, los clientes no podrán realizar compras pero podrán navegar por la tienda.
            </p>
          </div>
        </div>

        {/* Botón de guardado */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="btn-primario inline-flex items-center gap-2"
          >
            <Save size={16} />
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
