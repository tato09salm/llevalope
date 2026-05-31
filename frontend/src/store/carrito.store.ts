import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Producto, VarianteProducto } from '../types';

interface ItemCarritoLocal {
  producto: Producto;
  variante: VarianteProducto;
  cantidad: number;
}

interface CarritoState {
  items: ItemCarritoLocal[];
  totalItems: number;
  subtotal: number;
  agregar: (producto: Producto, variante: VarianteProducto, cantidad?: number) => void;
  quitar: (varianteId: number) => void;
  actualizarCantidad: (varianteId: number, cantidad: number) => void;
  vaciar: () => void;
  calcularTotales: () => void;
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,

      agregar: (producto, variante, cantidad = 1) => {
        const { items } = get();
        const existe = items.find((i) => i.variante.id === variante.id);

        let nuevosItems;
        if (existe) {
          nuevosItems = items.map((i) =>
            i.variante.id === variante.id
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i,
          );
        } else {
          nuevosItems = [...items, { producto, variante, cantidad }];
        }

        set({ items: nuevosItems });
        get().calcularTotales();
      },

      quitar: (varianteId) => {
        const nuevosItems = get().items.filter((i) => i.variante.id !== varianteId);
        set({ items: nuevosItems });
        get().calcularTotales();
      },

      actualizarCantidad: (varianteId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(varianteId);
          return;
        }
        const nuevosItems = get().items.map((i) =>
          i.variante.id === varianteId ? { ...i, cantidad } : i,
        );
        set({ items: nuevosItems });
        get().calcularTotales();
      },

      vaciar: () => set({ items: [], totalItems: 0, subtotal: 0 }),

      calcularTotales: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
        const subtotal = items.reduce(
          (sum, i) => {
            const precio = i.variante.enOferta && i.variante.precioOferta 
              ? i.variante.precioOferta 
              : i.variante.precioBase;
            return sum + Number(precio) * i.cantidad;
          },
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
