import type { Metadata } from 'next';
import { Poppins, Montserrat } from 'next/font/google';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '../components/providers/Providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'LlevaloPe - Tu Tienda Online, Sin Límites',
  description:
    'Compra online con seguridad. Miles de productos al mejor precio con envíos a todo el Perú. Tecnología, hogar, moda, belleza y más.',
  keywords: 'tienda online, compras, Perú, e-commerce, ofertas',
  openGraph: {
    title: 'LlevaloPe - Tu Tienda Online',
    description: 'Compra con confianza y seguridad en LlevaloPe',
    type: 'website',
    locale: 'es_PE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${montserrat.variable}`} suppressHydrationWarning={true}>
      <body className="font-poppins bg-crema">
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0D1B2A',
              color: '#F5F3EE',
              borderRadius: '10px',
            },
            success: {
              iconTheme: { primary: '#D4AF37', secondary: '#0D1B2A' },
            },
          }}
        />
      </body>
    </html>
  );
}
