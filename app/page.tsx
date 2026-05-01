'use client';

import React from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { 
  TrendingUp, 
  CreditCard, 
  FileCheck, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Users,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Facturado Hoy', value: 'L 12,450.00', change: '+12%', trending: 'up', icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Facturado Mes', value: 'L 245,800.00', change: '+5%', trending: 'up', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Pagos Aprobados', value: '1,240', change: '+18%', trending: 'up', icon: FileCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Pagos Pendientes', value: '45', change: '-2%', trending: 'down', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const salesData = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3000 },
  { name: 'Mie', sales: 2000 },
  { name: 'Jue', sales: 2780 },
  { name: 'Vie', sales: 1890 },
  { name: 'Sab', sales: 2390 },
  { name: 'Dom', sales: 3490 },
];

const paymentStatusData = [
  { name: 'Aprobado', value: 85, color: '#10b981' },
  { name: 'Pendiente', value: 10, color: '#f59e0b' },
  { name: 'Rechazado', value: 5, color: '#ef4444' },
];

const recentInvoices = [
  { id: 'FAC-001-023', client: 'Juan Pérez', amount: 'L 2,500.00', status: 'ISSUED', date: 'Hace 5 min' },
  { id: 'FAC-001-022', client: 'María Rodríguez', amount: 'L 4,800.00', status: 'PAID', date: 'Hace 1 hora' },
  { id: 'FAC-001-021', client: 'Inversiones ABC', amount: 'L 12,000.00', status: 'SENT', date: 'Hace 3 horas' },
  { id: 'FAC-001-020', client: 'Carlos López', amount: 'L 1,200.00', status: 'VOIDED', date: 'Hace 5 horas' },
];

export default function Home() {
  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="bg-white p-3 border border-slate-200 rounded-sm shadow-sm relative overflow-hidden group hover:border-blue-400 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{stat.label}</p>
                  <div className="flex items-baseline justify-between">
                    <p className="text-xl font-mono font-bold tracking-tighter">{stat.value}</p>
                    <div className={cn(
                      "flex items-center text-[10px] font-bold",
                      stat.trending === 'up' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {stat.trending === 'up' ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className={cn("absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity", stat.color)}>
                    <stat.icon className="w-12 h-12 translate-x-3 translate-y-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border border-slate-200 rounded-sm shadow-sm bg-white overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest leading-none">Ventas por Día</h3>
                <span className="text-[9px] font-bold text-slate-400">Últimos 7 días</span>
              </div>
              <CardContent className="p-4">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.08}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#2563eb" 
                        strokeWidth={1.5}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 rounded-sm shadow-sm bg-white overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Estado de Pagos</h3>
              </div>
              <CardContent className="p-4">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {paymentStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-500">{item.name}</span>
                      </div>
                      <span className="text-slate-900 font-bold font-mono">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Invoices */}
            <Card className="lg:col-span-2 border border-slate-200 rounded-sm shadow-sm bg-white flex flex-col overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Facturas Recientes</h3>
                <Button variant="link" size="sm" className="text-[10px] text-blue-600 font-bold p-0 h-auto">Ver Historial</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-left">
                    <tr>
                      <th className="p-3 font-medium">ID Factura</th>
                      <th className="p-3 font-medium">Cliente</th>
                      <th className="p-3 font-medium">Monto</th>
                      <th className="p-3 font-medium text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-blue-600 font-medium">{invoice.id}</td>
                        <td className="p-3 text-slate-600 font-medium">{invoice.client}</td>
                        <td className="p-3 font-mono font-bold">{invoice.amount}</td>
                        <td className="p-3 text-right">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                            invoice.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : 
                            invoice.status === 'VOIDED' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            {/* Fiscal Health */}
            <div className="bg-slate-900 border border-slate-800 rounded-sm shadow-sm p-4 text-white flex flex-col space-y-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Control Fiscal SAR</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 uppercase">Uso de Rango Actual</span>
                    <span className="text-slate-200 font-mono">45 / 500</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '9%' }}
                      className="bg-blue-500 h-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">CAI Activo</span>
                    <span className="text-[11px] font-mono font-bold text-slate-200 truncate">123456-ABC789-XYZ</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Vencimiento Rango</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">240 Días Restantes</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-3">
                  <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Status de Sincronización</h4>
                  <div className="flex items-center justify-between bg-slate-800/50 p-2 border border-slate-700/50 rounded-sm">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Integración API</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 h-auto rounded-sm border-none">
                  SITUACIÓN FISCAL DETALLADA
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}
