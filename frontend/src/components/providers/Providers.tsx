'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import AppBootstrap from './AppBootstrap';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <AppBootstrap />
      {children}
    </GoogleOAuthProvider>
  );
}
