'use client';

import React from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileBox, 
  BarChart, 
  Table as TableIcon, 
  Download, 
  Calendar,
  FileText,
  CreditCard,
  Target,
  Hash
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const reportTypes = [
  { 
    title: 'Ventas y Recaudación', 
    desc: 'Consolidado de ingresos por todas las vías.', 
    icon: BarChart, 
    items: ['Ventas Diarias', 'Ventas Mensuales', 'Ingresos por Sucursal'] 
  },
  { 
    title: 'Reportes Fiscales', 
    desc: 'Documentación para contabilidad y SAR.', 
    icon: FileBox, 
    items: ['Facturas Emitidas', 'Facturas Anuladas / NC', 'Uso de Correlativos CAI'] 
  },
  { 
    title: 'Operaciones BAC', 
    desc: 'Detalle de transacciones bancarias.', 
    icon: CreditCard, 
    items: ['Pagos Aprobados', 'Pagos Rechazados', 'Conciliación Bancaria'] 
  },
  { 
    title: 'Auditoría y Sync', 
    desc: 'Logs de sistema y sincronización.', 
    icon: Target, 
    items: ['Logs de Storeganise', 'Historial de Correos', 'Auditoría de Usuarios'] 
  },
];

export default function ReportsPage() {
  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reportes y Generación de Datos</h1>
              <p className="text-slate-500 text-sm">Descarga y visualiza información estratégica de tu negocio.</p>
            </div>
            <Button variant="outline" className="rounded-xl flex gap-2">
              <Calendar className="w-4 h-4" />
              Período: Abril 2026
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((type) => (
              <Card key={type.title} className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-start gap-4 pb-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <type.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">{type.title}</CardTitle>
                    <CardDescription>{type.desc}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {type.items.map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{item}</span>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-primary">
                            <TableIcon className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-primary">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white p-8 overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mb-32 -mr-32" />
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
               <div className="space-y-4 text-center md:text-left">
                 <h2 className="text-2xl font-black tracking-tight">Reporte Fiscal Completo</h2>
                 <p className="text-slate-400 max-w-md">Descarga todos los documentos emitidos, anulados y movimientos de correlativos para tu contador en un solo paquete comprimido.</p>
                 <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                   <Badge className="bg-white/10 text-white border-none py-1.5 px-3 flex gap-2">
                     <FileText className="w-3 h-3" /> PDF Consolidados
                   </Badge>
                   <Badge className="bg-white/10 text-white border-none py-1.5 px-3 flex gap-2">
                     <TableIcon className="w-3 h-3" /> Excel SAR
                   </Badge>
                 </div>
               </div>
               <Button className="bg-primary text-white hover:bg-primary/90 font-bold px-8 py-7 rounded-2xl h-auto text-lg shadow-2xl shadow-primary/40">
                 <Download className="w-5 h-5 mr-3" /> Generar Paquete Fiscal
               </Button>
             </div>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}
