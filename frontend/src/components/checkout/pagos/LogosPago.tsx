'use client';

// ========================
// Logos de métodos de pago.
// Yape, Plin y PayPal usan las imágenes reales ubicadas en /public/logos-pago.
// El resto sigue usando insignias genéricas (inline SVG) con los colores
// asociados a cada marca, ya que no contamos con el logo oficial de esas.
// ========================

interface LogoProps {
  size?: number;
  className?: string;
}

const Badge = ({
  size = 40,
  bg,
  fg = '#fff',
  texto,
  className,
  radius = 10,
}: LogoProps & { bg: string; fg?: string; texto: string; radius?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
    <rect width="40" height="40" rx={radius} fill={bg} />
    <text
      x="20"
      y="25"
      textAnchor="middle"
      fontSize={texto.length > 3 ? 10 : 13}
      fontWeight="700"
      fontFamily="Poppins, Arial, sans-serif"
      fill={fg}
    >
      {texto}
    </text>
  </svg>
);

// Contenedor común para logos que son imágenes reales (jpg/png):
// fondo blanco redondeado + la imagen centrada con object-contain,
// para que se vean consistentes con los badges SVG del resto de métodos.
const ImagenLogo = ({
  src,
  alt,
  size = 40,
  className,
  bg = '#fff',
  padding = 6,
}: LogoProps & { src: string; alt: string; bg?: string; padding?: number }) => (
  <span
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: size * 0.25,
      background: bg,
      overflow: 'hidden',
      flexShrink: 0,
    }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt={alt}
      style={{
        width: size - padding,
        height: size - padding,
        objectFit: 'contain',
      }}
    />
  </span>
);

export const LogoYape = (props: LogoProps) => (
  <ImagenLogo {...props} src="/logos-pago/yape.jpg" alt="Yape" padding={0} />
);
export const LogoPlin = (props: LogoProps) => (
  <ImagenLogo {...props} src="/logos-pago/plin.png" alt="Plin" padding={0} />
);
export const LogoPaypal = (props: LogoProps) => (
  <ImagenLogo {...props} src="/logos-pago/paypal.png" alt="PayPal" bg="#fff" padding={8} />
);

export const LogoQRUnificado = (props: LogoProps) => (
  <svg width={props.size ?? 40} height={props.size ?? 40} viewBox="0 0 40 40" className={props.className} aria-hidden>
    <rect width="40" height="40" rx="10" fill="#1B263B" />
    <rect x="7" y="7" width="10" height="10" fill="#fff" />
    <rect x="23" y="7" width="10" height="10" fill="#fff" />
    <rect x="7" y="23" width="10" height="10" fill="#fff" />
    <rect x="24" y="24" width="3" height="3" fill="#fff" />
    <rect x="29" y="24" width="3" height="3" fill="#fff" />
    <rect x="24" y="29" width="3" height="3" fill="#fff" />
    <rect x="29" y="29" width="3" height="3" fill="#fff" />
  </svg>
);
export const LogoBim = (props: LogoProps) => <Badge {...props} bg="#E30613" texto="Bim" />;
export const LogoLukita = (props: LogoProps) => <Badge {...props} bg="#FF6B00" texto="Lukita" />;
export const LogoVisa = (props: LogoProps) => <Badge {...props} bg="#1A1F71" texto="VISA" />;
export const LogoMastercard = (props: LogoProps) => (
  <svg width={props.size ?? 40} height={props.size ?? 40} viewBox="0 0 40 40" className={props.className} aria-hidden>
    <rect width="40" height="40" rx="10" fill="#F5F3EE" />
    <circle cx="16" cy="20" r="9" fill="#EB001B" fillOpacity="0.85" />
    <circle cx="24" cy="20" r="9" fill="#F79E1B" fillOpacity="0.85" />
  </svg>
);
export const LogoAmex = (props: LogoProps) => <Badge {...props} bg="#006FCF" texto="AMEX" />;
export const LogoDiners = (props: LogoProps) => <Badge {...props} bg="#0079BE" texto="Diners" />;
export const LogoTarjetaGenerica = (props: LogoProps) => <Badge {...props} bg="#0D1B2A" texto="Tarjeta" />;
export const LogoTransferencia = (props: LogoProps) => <Badge {...props} bg="#006D77" texto="Banco" />;
export const LogoPagoEfectivo = (props: LogoProps) => <Badge {...props} bg="#D4AF37" fg="#0D1B2A" texto="CIP" />;
export const LogoMercadoPago = (props: LogoProps) => <Badge {...props} bg="#00A9E0" texto="MP" />;
export const LogoContraEntrega = (props: LogoProps) => <Badge {...props} bg="#7A7D85" texto="$" />;

const LOGOS_POR_ID: Record<string, (props: LogoProps) => JSX.Element> = {
  YAPE: LogoYape,
  PLIN: LogoPlin,
  QR_UNIFICADO: LogoQRUnificado,
  BIM: LogoBim,
  LUKITA: LogoLukita,
  TARJETA: LogoTarjetaGenerica,
  TRANSFERENCIA: LogoTransferencia,
  PAGOEFECTIVO: LogoPagoEfectivo,
  PAYPAL: LogoPaypal,
  MERCADOPAGO: LogoMercadoPago,
  CONTRA_ENTREGA: LogoContraEntrega,
};

export function LogoMetodo({ id, ...props }: LogoProps & { id: string }) {
  const Componente = LOGOS_POR_ID[id] || LogoTarjetaGenerica;
  return <Componente {...props} />;
}

export function LogosMarcasTarjeta({ marca }: { marca: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DINERS' | 'DESCONOCIDA' }) {
  switch (marca) {
    case 'VISA':
      return <LogoVisa size={32} />;
    case 'MASTERCARD':
      return <LogoMastercard size={32} />;
    case 'AMEX':
      return <LogoAmex size={32} />;
    case 'DINERS':
      return <LogoDiners size={32} />;
    default:
      return <LogoTarjetaGenerica size={32} />;
  }
}