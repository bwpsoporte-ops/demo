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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Send, CheckCircle2, XCircle, Clock, RefreshCw, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface EmailLog {
  id: string;
  invoiceNumber: string;
  recipient: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING';
  sentAt: any;
  error?: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Note: This collection might not exist yet, we'll listen anyway
    const q = query(collection(db, 'email_logs'), orderBy('sentAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailLog));
      setEmails(data);
      setLoading(false);
    }, (error) => {
      console.warn("Email logs collection may not exist yet.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status: EmailLog['status']) => {
    switch (status) {
      case 'SENT': return <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold px-3">ENVIADO</Badge>;
      case 'FAILED': return <Badge className="bg-rose-50 text-rose-600 border-none font-bold px-3">FALLIDO</Badge>;
      case 'RETRYING': return <Badge className="bg-amber-50 text-amber-600 border-none font-bold px-3">REINTENTANDO</Badge>;
      case 'PENDING': return <Badge className="bg-slate-100 text-slate-500 border-none font-bold px-3">PENDIENTE</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Comunicaciones</h1>
              <p className="text-slate-500 text-sm">Control de envío de facturas y notificaciones por correo electrónico.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entregados</p>
                  <p className="text-2xl font-bold text-slate-800">1,120</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">En Cola</p>
                  <p className="text-2xl font-bold text-slate-800">45</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-slate-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rebotados</p>
                  <p className="text-2xl font-bold text-slate-800">3</p>
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
                      placeholder="Buscar por destinatario o factura..." 
                      className="pl-9 w-80 rounded-xl border-slate-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="font-bold py-4">Fecha</TableHead>
                    <TableHead className="font-bold">Factura / Asunto</TableHead>
                    <TableHead className="font-bold">Destinatario</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.filter(e => e.recipient.includes(searchTerm) || e.invoiceNumber.includes(searchTerm)).map((email) => (
                    <TableRow key={email.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {email.sentAt ? format(email.sentAt.toDate(), 'dd/MM/yyyy HH:mm:ss') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-slate-800">{email.invoiceNumber}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{email.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-slate-600">{email.recipient}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {emails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                        No hay registros de envío.
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
