import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Producto } from '../types';

interface ItemCarritoLocal {
  producto: Producto;
  cantidad: number;
}

interface CarritoState {
  items: ItemCarritoLocal[];
  totalItems: number;
  subtotal: number;
  agregar: (producto: Producto, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  calcularTotales: () => void;
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,

      agregar: (producto, cantidad = 1) => {
        const { items } = get();
        const existe = items.find((i) => i.producto.id === producto.id);

        let nuevosItems;
        if (existe) {
          nuevosItems = items.map((i) =>
            i.producto.id === producto.id
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i,
          );
        } else {
          nuevosItems = [...items, { producto, cantidad }];
        }

        set({ items: nuevosItems });
        get().calcularTotales();
      },

      quitar: (productoId) => {
        const nuevosItems = get().items.filter((i) => i.producto.id !== productoId);
        set({ items: nuevosItems });
        get().calcularTotales();
      },

      actualizarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(productoId);
          return;
        }
        const nuevosItems = get().items.map((i) =>
          i.producto.id === productoId ? { ...i, cantidad } : i,
        );
        set({ items: nuevosItems });
        get().calcularTotales();
      },

      vaciar: () => set({ items: [], totalItems: 0, subtotal: 0 }),

      calcularTotales: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.producto.precio) * i.cantidad,
          0,
        );
        set({ totalItems, subtotal });
      },
    }),
    {
      name: 'llevalope-carrito',
    },
  ),
);
