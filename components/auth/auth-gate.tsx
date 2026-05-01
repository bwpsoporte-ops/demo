'use client';

import React from 'react';
import { useFirebase } from '@/components/providers/firebase-provider';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useFirebase();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-slate-500 font-medium tracking-tight">Cargando BWP FiscalPay...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-vh-100 bg-slate-50 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">BWP</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">BWP FiscalPay Integrator</h1>
          <p className="text-slate-500 text-center mb-8">Administración de pagos, facturas y cumplimiento fiscal.</p>
          
          <Button onClick={signIn} className="w-full py-6 rounded-xl text-lg font-semibold flex gap-3 shadow-lg shadow-primary/20">
            <LogIn className="w-5 h-5" />
            Ingresar con Google
          </Button>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Acceso restringido a personal autorizado.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
