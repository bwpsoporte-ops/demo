'use client';

import React, { useState, useEffect } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCcw, ExternalLink, ArrowRight, Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface BacPayment {
  id: string;
  bacTransactionId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  date: any;
  status: 'INITIATED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  bankReference: string;
  syncStatus: string;
  invoiceId: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<BacPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bac_payments'), orderBy('date', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BacPayment));
      setPayments(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bac_payments');
    });
    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status: BacPayment['status']) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 font-bold">APROBADO</Badge>;
      case 'PENDING': return <Badge className="bg-amber-50 text-amber-600 border-none px-3 font-bold">PENDIENTE</Badge>;
      case 'REJECTED': return <Badge className="bg-rose-50 text-rose-600 border-none px-3 font-bold">RECHAZADO</Badge>;
      case 'FAILED': return <Badge className="bg-rose-100 text-rose-700 border-none px-3 font-bold">FALLIDO</Badge>;
      case 'CANCELLED': return <Badge className="bg-slate-100 text-slate-500 border-none px-3 font-bold">CANCELADO</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pasarela de Pagos BAC</h1>
              <p className="text-slate-500 text-sm">Monitoreo en tiempo real de transacciones bancarias.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl flex gap-2">
                <RefreshCcw className="w-4 h-4" />
                Sincronizar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aprobados Mes</p>
                  <p className="text-2xl font-bold text-slate-800">458</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pendientes</p>
                  <p className="text-2xl font-bold text-slate-800">12</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rechazados</p>
                  <p className="text-2xl font-bold text-slate-800">8</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
             <CardHeader className="bg-white border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      placeholder="Buscar por ID, Cliente o Referencia..." 
                      className="pl-9 w-80 rounded-xl border-slate-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100 font-bold">
                    <TableHead className="font-bold py-4">ID Transacción</TableHead>
                    <TableHead className="font-bold">Cliente</TableHead>
                    <TableHead className="font-bold">Monto / Moneda</TableHead>
                    <TableHead className="font-bold">Fecha / Hora</TableHead>
                    <TableHead className="font-bold">Estado BAC</TableHead>
                    <TableHead className="font-bold">Sinc. Storeganise</TableHead>
                    <TableHead className="font-bold text-right">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.filter(p => p.bacTransactionId.includes(searchTerm) || p.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map((payment) => (
                    <TableRow key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-tighter">
                            {payment.bacTransactionId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-slate-800">{payment.customerName}</p>
                          <p className="text-xs text-slate-500">{payment.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-900">{payment.currency} {payment.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {payment.date ? format(payment.date.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.syncStatus === 'SYNCED' ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none flex w-fit gap-1 font-bold">
                            SINCRONIZADO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-none flex w-fit gap-1 font-bold italic">
                            PENDIENTE
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                   {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                        {loading ? 'Cargando pagos...' : 'No se encontraron registros de pagos.'}
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
