import { create } from 'zustand';
import { usuariosAPI } from '@/lib/api';
import { Producto } from '@/types';

interface WishlistStore {
  items: any[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productoId: number) => Promise<void>;
  removeFromWishlist: (productoId: number) => Promise<void>;
  isInWishlist: (productoId: number) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  
  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const data = await usuariosAPI.obtenerWishlist();
      set({ items: data || [] });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      set({ loading: false });
    }
  },

  addToWishlist: async (productoId: number) => {
    try {
      const newItem = await usuariosAPI.agregarAWishlist(productoId);
      set((state) => ({ items: [...state.items, newItem] }));
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (productoId: number) => {
    try {
      await usuariosAPI.eliminarDeWishlist(productoId);
      set((state) => ({ items: state.items.filter((item) => item.productoId !== productoId) }));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  isInWishlist: (productoId: number) => {
    return get().items.some((item) => item.productoId === productoId);
  }
}));
