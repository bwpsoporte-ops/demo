'use client';

import React, { useState, useEffect } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, onSnapshot, getDocs, limit, orderBy, where } from 'firebase/firestore';
import { useFirebase } from '@/components/providers/firebase-provider';
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
import { Search, Filter, Download, Mail, Eye, MoreHorizontal, FileText, Plus, FileSpreadsheet, FileIcon as FilePdf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerRtn: string;
  issueDate: any;
  total: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'SENT' | 'FAILED_EMAIL' | 'VOIDED' | 'CANCELLED';
  paymentMethod: string;
  emailSent: boolean;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('issueDate', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        customerName: doc.data().customer?.fullName || 'N/A'
      } as Invoice));
      setInvoices(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'invoices');
    });
    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID': return <Badge className="bg-emerald-50 text-emerald-600 border-none">Pagada</Badge>;
      case 'ISSUED': return <Badge className="bg-blue-50 text-blue-600 border-none">Emitida</Badge>;
      case 'SENT': return <Badge className="bg-indigo-50 text-indigo-600 border-none">Enviada</Badge>;
      case 'VOIDED': return <Badge className="bg-slate-100 text-slate-500 border-none">Anulada</Badge>;
      case 'FAILED_EMAIL': return <Badge className="bg-rose-50 text-rose-600 border-none">Error Envío</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administración de Facturas</h1>
              <p className="text-slate-500 text-sm">Consulta, anula y gestiona tus documentos fiscales.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl flex gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Excel
              </Button>
              <Button className="rounded-xl flex gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Nueva Factura
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-4 flex flex-col items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Emitidas</p>
                <p className="text-2xl font-bold text-slate-800">1,245</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-4 flex flex-col items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pendientes Pago</p>
                <p className="text-2xl font-bold text-amber-600">84</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-4 flex flex-col items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pagadas Hoy</p>
                <p className="text-2xl font-bold text-emerald-600">12</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardContent className="p-4 flex flex-col items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Anuladas Mes</p>
                <p className="text-2xl font-bold text-slate-400">3</p>
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
                      placeholder="Buscar por cliente, número o RTN..." 
                      className="pl-9 w-80 rounded-xl border-slate-200 focus:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl flex gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 font-medium whitespace-nowrap">Filtrar por:</span>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32 rounded-xl">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ISSUED">Emitidas</SelectItem>
                      <SelectItem value="PAID">Pagadas</SelectItem>
                      <SelectItem value="VOIDED">Anuladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="font-bold py-4">Número Factura</TableHead>
                    <TableHead className="font-bold">Cliente / RTN</TableHead>
                    <TableHead className="font-bold">Emisión</TableHead>
                    <TableHead className="font-bold">Monto Total</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold">Correo</TableHead>
                    <TableHead className="font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.filter(i => i.invoiceNumber.includes(searchTerm) || i.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map((invoice) => (
                    <TableRow key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <p className="font-bold text-slate-800">{invoice.invoiceNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-slate-800">{invoice.customerName}</p>
                          <p className="text-xs text-slate-500">{invoice.customerRtn || 'Sin RTN'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 font-medium">
                          {invoice.issueDate ? format(invoice.issueDate.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-900">L {invoice.total.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {invoice.emailSent ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none flex w-fit gap-1">
                            <Mail className="w-3 h-3" /> Enviado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-100 text-slate-400 border-none flex w-fit gap-1">
                            <Mail className="w-3 h-3" /> Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                   {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                        {loading ? 'Cargando facturas...' : 'No se encontraron facturas.'}
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
