'use client';

import React, { useState, useEffect } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  read: boolean;
  resolved: boolean;
  createdAt: any;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      setAlerts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'alerts', id), { read: true });
    toast.success("Alerta marcada como leída");
  };

  const getAlertIcon = (level: Alert['level']) => {
    switch (level) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Centro de Notificaciones</h1>
              <p className="text-slate-500 text-sm">Monitorea eventos críticos y alertas del sistema.</p>
            </div>
            <Button variant="ghost" className="text-slate-400 hover:text-slate-600">
              <BellOff className="w-4 h-4 mr-2" /> Silenciar por 1h
            </Button>
          </div>

          <div className="space-y-4 max-w-4xl">
            {alerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "border-none shadow-xl transition-all duration-300 overflow-hidden relative",
                alert.read ? "shadow-slate-100 opacity-80" : "shadow-slate-200/60"
              )}>
                {!alert.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                <CardContent className="p-0">
                  <div className="p-6 flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0",
                      alert.level === 'CRITICAL' ? "bg-rose-50" : 
                      alert.level === 'WARNING' ? "bg-amber-50" : "bg-blue-50"
                    )}>
                      {getAlertIcon(alert.level)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-bold border-none",
                          alert.level === 'CRITICAL' ? "text-rose-600" : 
                          alert.level === 'WARNING' ? "text-amber-600" : "text-blue-600"
                        )}>
                          {alert.level}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {alert.createdAt ? format(alert.createdAt.toDate(), 'dd MMM, HH:mm') : 'N/A'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">{alert.type}</h4>
                      <p className="text-xs text-slate-500">{alert.message}</p>
                      
                      <div className="pt-4 flex gap-3">
                        {!alert.read && (
                          <Button onClick={() => markAsRead(alert.id)} size="sm" variant="outline" className="text-[10px] font-bold py-0 h-8 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Marcar Leída
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-[10px] font-bold py-0 h-8 rounded-lg text-primary">
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Todo en orden</h3>
                <p className="text-sm text-slate-400">No tienes alertas pendientes por revisar.</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
