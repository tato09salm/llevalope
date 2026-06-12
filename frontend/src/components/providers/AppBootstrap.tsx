'use client';

import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '../../store/auth.store';
import { useCarritoStore } from '../../store/carrito.store';
import { useWishlistStore } from '../../store/wishlist.store';

export default function AppBootstrap() {
  const { usuario, cargarPerfil } = useAuthStore();
  const { sincronizarConServidor, desvincularSesion } = useCarritoStore();
  const { fetchWishlist } = useWishlistStore();
  const perfilIntentado = useRef(false);

  useEffect(() => {
    if (perfilIntentado.current) return;
    perfilIntentado.current = true;

    if (!Cookies.get('llevalope_token')) {
      desvincularSesion();
      return;
    }

    cargarPerfil().catch(() => {
      desvincularSesion();
    });
  }, [cargarPerfil, desvincularSesion]);

  useEffect(() => {
    if (!usuario) {
      desvincularSesion();
      return;
    }

    sincronizarConServidor(usuario.id).catch(() => {
      // El store conserva el carrito local si la sincronizacion falla.
    });
    
    fetchWishlist().catch(() => {
      // Error al cargar wishlist
    });
  }, [usuario, sincronizarConServidor, desvincularSesion, fetchWishlist]);

  return null;
}
