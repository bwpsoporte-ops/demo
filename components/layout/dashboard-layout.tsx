'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirebase } from '@/components/providers/firebase-provider';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Users,
  RefreshCw,
  Hash,
  Bell,
  BarChart3,
  Mail,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/payments', label: 'Pagos BAC', icon: CreditCard },
  { href: '/invoices', label: 'Facturas', icon: FileText },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/sync', label: 'Sincronización', icon: RefreshCw },
  { href: '/cai', label: 'CAI y Rangos', icon: Hash },
  { href: '/alerts', label: 'Alertas', icon: Bell },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/emails', label: 'Correos', icon: Mail },
  { href: '/templates', label: 'Plantillas', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { logout, user } = useFirebase();

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-60 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out transform",
          !isSidebarOpen ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-12 flex items-center px-4 border-b border-slate-800 mb-2 shrink-0">
            <div className="w-4 h-4 bg-blue-500 rounded-sm shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white/20 rounded-sm"></div>
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-2 font-bold text-sm tracking-tight text-white flex items-center gap-2"
              >
                BWP FiscalPay <span className="text-[10px] font-normal opacity-50">v1.2</span>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center h-9 px-2 rounded-sm transition-all duration-200 group relative",
                      isActive 
                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-blue-400" : "opacity-70 group-hover:opacity-100")} />
                    {isSidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-2.5 font-medium text-[11px] whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    {isActive && (
                      <div className="absolute left-0 h-4 w-0.5 bg-blue-400 rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Section */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/30 shrink-0">
            <div className={cn(
              "flex items-center gap-3",
              !isSidebarOpen && "justify-center"
            )}>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0 overflow-hidden flex items-center justify-center text-[10px] text-white">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0) || 'A'
                )}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-200 leading-none truncate">{user?.displayName || 'Admin BWP'}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user?.email || 'Superuser'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:flex hidden h-8 w-8"
            >
              <Menu className="w-4 h-4 text-slate-500" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-8 w-8"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-4 h-4 text-slate-500" />
            </Button>
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
              </h2>
              <span className="h-3 w-px bg-slate-200 hidden md:block"></span>
              <span className="text-[10px] text-slate-500 hidden md:block">BWP FiscalPay Integrator</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                BAC API: Online
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Storeganise: Online
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden lg:block"></div>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-slate-400 hover:text-rose-500">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
