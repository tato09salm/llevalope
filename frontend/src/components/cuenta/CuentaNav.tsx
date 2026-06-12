'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/cuenta', label: 'Perfil' },
  { href: '/cuenta/direcciones', label: 'Direcciones' },
  { href: '/cuenta/pedidos', label: 'Pedidos' },
  { href: '/cuenta/soporte', label: 'Soporte' },
];

export default function CuentaNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            pathname === link.href
              ? 'bg-azul-oscuro text-white'
              : 'bg-white text-azul-oscuro border border-gray-200 hover:border-teal'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
