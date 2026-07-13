'use client';

import { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface AdminShellProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AdminShell({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: AdminShellProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header específico de la página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-teal" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold font-montserrat text-azul-oscuro truncate">{title}</h1>
            {description && <p className="text-gris-elegante text-xs mt-0.5">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Contenido */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
