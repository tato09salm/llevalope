'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  valor: string;
  size?: number;
  colorPrincipal?: string;
}

/**
 * Wrapper del QR real generado con qrcode.react. El valor codificado es un
 * string determinístico de simulación (no un link de cobro real).
 */
export default function QRDisplay({ valor, size = 200, colorPrincipal = '#0D1B2A' }: QRDisplayProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 inline-flex">
      <QRCodeSVG
        value={valor}
        size={size}
        fgColor={colorPrincipal}
        bgColor="#ffffff"
        level="M"
        marginSize={0}
      />
    </div>
  );
}
