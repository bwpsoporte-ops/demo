import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { FirebaseProvider } from '@/components/providers/firebase-provider';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'BWP FiscalPay Integrator',
  description: 'Dashboard administrativo para integración de pagos y facturación fiscal.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <FirebaseProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
