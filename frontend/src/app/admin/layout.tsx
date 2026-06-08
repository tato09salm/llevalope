'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { usuario, cargarPerfil } = useAuthStore();
  const [verificando, setVerificando] = useState(true);

  const rolesPermitidos = useMemo(() => new Set(['ADMIN', 'GERENTE', 'OPERADOR']), []);

  useEffect(() => {
    (async () => {
      await cargarPerfil();
      setVerificando(false);
    })();
  }, [cargarPerfil]);

  useEffect(() => {
    if (verificando) return;

    if (!usuario) {
      router.replace('/auth/iniciar-sesion');
      return;
    }

    if (!rolesPermitidos.has(usuario.rol)) {
      router.replace('/');
    }
  }, [router, rolesPermitidos, usuario, verificando]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-teal" />
      </div>
    );
  }

  return <>{children}</>;
}

