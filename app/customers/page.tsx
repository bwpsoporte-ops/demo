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
import { Search, Filter, Plus, Mail, Phone, MapPin, Building2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Customer {
  id: string;
  fullName: string;
  company: string;
  rtn: string;
  email: string;
  phone: string;
  address: string;
  storeganiseId: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'customers'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'customers');
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Clientes</h1>
              <p className="text-slate-500 text-sm">Gestiona la información fiscal y de contacto de tus clientes.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="rounded-xl flex gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Nuevo Cliente
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Buscar por nombre, RTN o correo..." 
                    className="pl-9 rounded-xl border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100 font-bold">
                    <TableHead className="font-bold py-4">Nombre / Empresa</TableHead>
                    <TableHead className="font-bold">RTN</TableHead>
                    <TableHead className="font-bold">Contacto</TableHead>
                    <TableHead className="font-bold">Storeganise ID</TableHead>
                    <TableHead className="font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.filter(c => c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || (c.rtn && c.rtn.includes(searchTerm))).map((customer) => (
                    <TableRow key={customer.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {customer.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{customer.fullName}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <Building2 className="w-3 h-3" />
                              {customer.company || 'Personal'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          {customer.rtn || 'PENDIENTE'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-600">
                             <Mail className="w-3 h-3" /> {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                             <Phone className="w-3 h-3" /> {customer.phone || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] tracking-tight">{customer.storeganiseId}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                        {loading ? 'Cargando clientes...' : 'No hay clientes registrados.'}
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
