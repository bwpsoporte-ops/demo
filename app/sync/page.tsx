'use client';

import React, { useState, useEffect } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, RefreshCw, AlertCircle, CheckCircle2, Clock, Terminal } from 'lucide-react';
import { format } from 'date-fns';

interface SyncLog {
  id: string;
  storeganiseId: string;
  type: string;
  status: 'RECEIVED' | 'PROCESSING' | 'SYNCED' | 'FAILED' | 'RETRYING';
  message: string;
  timestamp: any;
  payload: any;
}

export default function SyncPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'storeganise_sync'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SyncLog));
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status: SyncLog['status']) => {
    switch (status) {
      case 'SYNCED': return <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">COMPLETADO</Badge>;
      case 'FAILED': return <Badge className="bg-rose-50 text-rose-600 border-none font-bold">FALLIDO</Badge>;
      case 'PROCESSING': return <Badge className="bg-blue-50 text-blue-600 border-none font-bold">PROCESANDO</Badge>;
      case 'RECEIVED': return <Badge className="bg-slate-100 text-slate-500 border-none font-bold">RECIBIDO</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sincronización Storeganise</h1>
              <p className="text-slate-500 text-sm">Monitoreo de comunicación e integración de órdenes externas.</p>
            </div>
            <Button className="rounded-xl flex gap-2">
              <RefreshCw className="w-4 h-4" />
              Forzar Resync
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Webhooks</p>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-slate-800">2,450</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exitosos</p>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-2xl font-bold text-slate-800">2,442</span>
                </div>
              </CardContent>
            </Card>
             <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fallidos</p>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <span className="text-2xl font-bold text-slate-800">8</span>
                </div>
              </CardContent>
            </Card>
             <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Latencia Prom.</p>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-2xl font-bold text-slate-800">1.2s</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-400" />
                Registros Recientes (API Storeganise)
              </CardTitle>
              <CardDescription>Consulta el historial de peticiones recibidas vía Webhook.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="py-4 font-bold">Timestamp</TableHead>
                    <TableHead className="font-bold">ID / Referencia</TableHead>
                    <TableHead className="font-bold">Acción / Tipo</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold">Mensaje / Resultado</TableHead>
                    <TableHead className="text-right font-bold">Ver JSON</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-50">
                      <TableCell className="text-xs font-medium text-slate-500">
                        {log.timestamp ? format(log.timestamp.toDate(), 'dd/MM HH:mm:ss.SSS') : 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] font-bold text-slate-600 uppercase">
                        {log.storeganiseId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200">{log.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                        {log.message}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-slate-400 h-8">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                        Esperando peticiones entrantes...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}
