import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { Producto, VarianteProducto } from '../types';
import { usuariosAPI } from '../lib/api';
import { obtenerPrecioVigente, redondearMoneda } from '../lib/commerce';

interface ItemCarritoLocal {
  producto: Producto;
  variante: VarianteProducto;
  cantidad: number;
}

interface CarritoState {
  items: ItemCarritoLocal[];
  totalItems: number;
  subtotal: number;
  cargandoSync: boolean;
  usuarioSincronizado: number | null;
  agregar: (producto: Producto, variante: VarianteProducto, cantidad?: number) => Promise<void>;
  quitar: (varianteId: number) => Promise<void>;
  actualizarCantidad: (varianteId: number, cantidad: number) => Promise<void>;
  vaciar: () => Promise<void>;
  sincronizarConServidor: (usuarioId: number) => Promise<void>;
  cargarDesdeServidor: (usuarioId?: number) => Promise<void>;
  desvincularSesion: () => void;
  calcularTotales: () => void;
}

const tieneSesionActiva = () => Boolean(Cookies.get('llevalope_token'));

const normalizarItemServidor = (item: any): ItemCarritoLocal => ({
  producto: item.producto,
  variante: item.variante,
  cantidad: item.cantidad,
});

const aplicarAgregadoLocal = (
  items: ItemCarritoLocal[],
  producto: Producto,
  variante: VarianteProducto,
  cantidad: number,
) => {
  const existe = items.find((i) => i.variante.id === variante.id);
  if (existe) {
    return items.map((i) =>
      i.variante.id === variante.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
    );
  }
  return [...items, { producto, variante, cantidad }];
};

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      cargandoSync: false,
      usuarioSincronizado: null,

      agregar: async (producto, variante, cantidad = 1) => {
        if (!tieneSesionActiva()) {
          set({ items: aplicarAgregadoLocal(get().items, producto, variante, cantidad) });
          get().calcularTotales();
          return;
        }

        await usuariosAPI.agregarCarrito(producto.id, variante.id, cantidad);
        await get().cargarDesdeServidor(get().usuarioSincronizado || undefined);
      },

      quitar: async (varianteId) => {
        if (!tieneSesionActiva()) {
          const nuevosItems = get().items.filter((i) => i.variante.id !== varianteId);
          set({ items: nuevosItems });
          get().calcularTotales();
          return;
        }

        await usuariosAPI.eliminarDelCarrito(varianteId);
        await get().cargarDesdeServidor(get().usuarioSincronizado || undefined);
      },

      actualizarCantidad: async (varianteId, cantidad) => {
        if (cantidad <= 0) {
          await get().quitar(varianteId);
          return;
        }

        if (!tieneSesionActiva()) {
          const nuevosItems = get().items.map((i) =>
            i.variante.id === varianteId ? { ...i, cantidad } : i,
          );
          set({ items: nuevosItems });
          get().calcularTotales();
          return;
        }

        await usuariosAPI.actualizarCantidadCarrito(varianteId, cantidad);
        await get().cargarDesdeServidor(get().usuarioSincronizado || undefined);
      },

      vaciar: async () => {
        if (!tieneSesionActiva()) {
          set({ items: [], totalItems: 0, subtotal: 0 });
          return;
        }

        await usuariosAPI.vaciarCarrito();
        set({ items: [], totalItems: 0, subtotal: 0 });
      },

      sincronizarConServidor: async (usuarioId) => {
        if (!tieneSesionActiva()) return;

        set({ cargandoSync: true });
        try {
          const { usuarioSincronizado, items } = get();

          if (usuarioSincronizado !== usuarioId && items.length > 0) {
            for (const item of items) {
              await usuariosAPI.agregarCarrito(item.producto.id, item.variante.id, item.cantidad);
            }
          }

          await get().cargarDesdeServidor(usuarioId);
          set({ usuarioSincronizado: usuarioId });
        } finally {
          set({ cargandoSync: false });
        }
      },

      cargarDesdeServidor: async (usuarioId) => {
        if (!tieneSesionActiva()) return;

        const data: any = await usuariosAPI.obtenerCarrito();
        const items = Array.isArray(data) ? data.map(normalizarItemServidor) : [];
        set({
          items,
          usuarioSincronizado: usuarioId ?? get().usuarioSincronizado,
        });
        get().calcularTotales();
      },

      desvincularSesion: () => {
        set({ usuarioSincronizado: null, cargandoSync: false });
      },

      calcularTotales: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
        const subtotal = items.reduce(
          (sum, i) => {
            const precio = obtenerPrecioVigente(i.variante);
            const subtotalLinea = precio * i.cantidad;
            const descuentoVolumen = i.cantidad >= 3 ? subtotalLinea * 0.05 : 0;
            return sum + subtotalLinea - descuentoVolumen;
          },
          0,
        );
        set({ totalItems, subtotal: redondearMoneda(subtotal) });
      },
    }),
    {
      name: 'llevalope-carrito',
    },
  ),
);
