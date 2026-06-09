import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { Usuario } from '../types';
import { authAPI } from '../lib/api';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  registrar: (datos: any) => Promise<void>;
  cerrarSesion: () => void;
  cargarPerfil: () => Promise<void>;
  limpiarError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      cargando: false,
      error: null,

      iniciarSesion: async (correo, contrasena) => {
        set({ cargando: true, error: null });
        try {
          const resp: any = await authAPI.iniciarSesion({ correo, contrasena });
          Cookies.set('llevalope_token', resp.token, {
            expires: 7,
            sameSite: 'strict',
            secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
          });
          set({ usuario: resp.usuario, token: resp.token, cargando: false });
        } catch (err: any) {
          set({
            error: err.message || 'Error al iniciar sesión',
            cargando: false,
          });
          throw err;
        }
      },

      registrar: async (datos) => {
        set({ cargando: true, error: null });
        try {
          const resp: any = await authAPI.registrar(datos);
          Cookies.set('llevalope_token', resp.token, {
            expires: 7,
            sameSite: 'strict',
            secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
          });
          set({ usuario: resp.usuario, token: resp.token, cargando: false });
        } catch (err: any) {
          set({ error: err.message || 'Error al registrarse', cargando: false });
          throw err;
        }
      },

      cerrarSesion: () => {
        Cookies.remove('llevalope_token');
        set({ usuario: null, token: null });
      },

      cargarPerfil: async () => {
        try {
          const usuario: any = await authAPI.perfil();
          set({ usuario });
        } catch {
          get().cerrarSesion();
        }
      },

      limpiarError: () => set({ error: null }),
    }),
    {
      name: 'llevalope-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
