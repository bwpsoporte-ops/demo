'use client';

import React, { useState, useEffect } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, Timestamp } from 'firebase/firestore';
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
import { Plus, Search, Filter, MoreVertical, Edit2, ShieldAlert, CheckCircle2, AlertTriangle, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CaiRange {
  id: string;
  cai: string;
  documentType: string;
  establishment: string;
  emissionPoint: string;
  initialRange: number;
  finalRange: number;
  currentCorrelative: number;
  deadlineDate: any;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'BLOCKED';
  branch: string;
}

export default function CaiPage() {
  const [ranges, setRanges] = useState<CaiRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user, isAdmin } = useFirebase();

  // New range form state
  const [newRange, setNewRange] = useState({
    cai: '',
    documentType: 'Factura',
    establishment: '000',
    emissionPoint: '001',
    initialRange: 1,
    finalRange: 1000,
    deadlineDate: '',
    branch: 'Principal',
  });

  useEffect(() => {
    const q = query(collection(db, 'cai_ranges'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaiRange));
      setRanges(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cai_ranges');
    });
    return () => unsubscribe();
  }, []);

  const handleAddRange = async () => {
    try {
      if (!isAdmin) {
        toast.error("No tienes permisos para realizar esta acción.");
        return;
      }

      await addDoc(collection(db, 'cai_ranges'), {
        ...newRange,
        currentCorrelative: newRange.initialRange,
        status: 'ACTIVE',
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        deadlineDate: Timestamp.fromDate(new Date(newRange.deadlineDate)),
      });

      toast.success("Rango CAI registrado exitosamente");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar el rango CAI");
    }
  };

  const toggleStatus = async (range: CaiRange) => {
    const newStatus = range.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'cai_ranges', range.id), {
        status: newStatus
      });
      toast.success(`Rango marcado como ${newStatus}`);
    } catch (err) {
      toast.error("Error al actualizar estado");
    }
  };

  const getStatusBadge = (status: CaiRange['status']) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-emerald-50 text-emerald-600 border-none">Activo</Badge>;
      case 'INACTIVE': return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none">Inactivo</Badge>;
      case 'EXPIRED': return <Badge className="bg-rose-50 text-rose-600 border-none">Vencido</Badge>;
      case 'EXHAUSTED': return <Badge className="bg-amber-50 text-amber-600 border-none">Agotado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CAI y Rangos Correlativos</h1>
              <p className="text-slate-500 text-sm">Gestiona la autorización fiscal de la SAR para tus documentos.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl flex gap-2">
                <ShieldAlert className="w-4 h-4" />
                Alertas Config
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl flex gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Nuevo Rango
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Registrar Nuevo Rango CAI</DialogTitle>
                    <DialogDescription>Completa la información autorizada por la SAR.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="cai">CAI</Label>
                      <Input 
                        id="cai" 
                        placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX"
                        className="font-mono uppercase"
                        value={newRange.cai}
                        onChange={(e) => setNewRange({...newRange, cai: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Documento</Label>
                      <Select value={newRange.documentType} onValueChange={(v) => setNewRange({...newRange, documentType: v})}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Factura">Factura</SelectItem>
                          <SelectItem value="Nota de Crédito">Nota de Crédito</SelectItem>
                          <SelectItem value="Nota de Débito">Nota de Débito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Fecha Límite Emisión</Label>
                      <Input 
                        id="deadline" 
                        type="date"
                        value={newRange.deadlineDate}
                        onChange={(e) => setNewRange({...newRange, deadlineDate: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Estab.</Label>
                        <Input placeholder="000" value={newRange.establishment} onChange={(e) => setNewRange({...newRange, establishment: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Punto Emis.</Label>
                        <Input placeholder="001" value={newRange.emissionPoint} onChange={(e) => setNewRange({...newRange, emissionPoint: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rango Inicial</Label>
                        <Input type="number" value={newRange.initialRange} onChange={(e) => setNewRange({...newRange, initialRange: parseInt(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Rango Final</Label>
                        <Input type="number" value={newRange.finalRange} onChange={(e) => setNewRange({...newRange, finalRange: parseInt(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddRange} className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Guardar Rango
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-primary/5 border-primary/10">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Hash className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Rango Activo</p>
                  <p className="text-lg font-bold text-slate-800">Facturación Principal</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-emerald-50/50 border-emerald-100">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Correlativos Libres</p>
                  <p className="text-lg font-bold text-slate-800">455 Disponibles</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-rose-50/50 border-rose-100">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Vencimiento Próximo</p>
                  <p className="text-lg font-bold text-slate-800">En 30 Días</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-base font-bold text-slate-800">Listado de CAIs Autorizados</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      placeholder="Buscar por CAI..." 
                      className="pl-9 w-64 rounded-xl border-slate-200"
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
                  <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                    <TableHead className="font-bold py-4">CAI / Documento</TableHead>
                    <TableHead className="font-bold">Rango Autorizado</TableHead>
                    <TableHead className="font-bold">Correlativo Actual</TableHead>
                    <TableHead className="font-bold">Límite Emision</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranges.filter(r => r.cai.includes(searchTerm)).map((range) => (
                    <TableRow key={range.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <TableCell>
                        <div>
                          <p className="text-xs font-mono font-bold text-slate-400 mb-1">{range.cai}</p>
                          <p className="font-bold text-slate-800">{range.documentType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {range.establishment}-{range.emissionPoint}-01-{String(range.initialRange).padStart(8, '0')}
                          </span>
                          <span className="text-slate-300">al</span>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {range.establishment}-{range.emissionPoint}-01-{String(range.finalRange).padStart(8, '0')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {String(range.currentCorrelative).padStart(8, '0')}
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(100, (range.currentCorrelative / range.finalRange) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-slate-600">
                          {range.deadlineDate ? format(range.deadlineDate.toDate(), 'dd/MM/yyyy') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(range.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(range)}>
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ranges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                        No hay rangos registrados.
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
