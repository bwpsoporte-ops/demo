'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/components/providers/firebase-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Building2, 
  FileCheck, 
  Eye, 
  Save, 
  RotateCcw, 
  Image as ImageIcon,
  Type,
  Layout as LayoutIcon,
  Table as TableIcon,
  Check,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useFirebase();
  const [template, setTemplate] = useState<any>({
    config: {
      name: 'Factura BWP Principal',
      type: 'Factura',
      paperSize: 'Carta',
      currency: 'HNL',
      active: true,
    },
    company: {
      commercialName: 'BWP FiscalPay Integrator',
      legalName: 'BWPENTESTING S. DE R.L.',
      rtn: '0801-1995-000000',
      address: 'Roatán, Islas de la Bahía, Honduras',
      phone: '+504 8828-5822',
      email: 'info@bwpentesting.com',
      website: 'www.bwpentesting.com',
    },
    design: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      textColor: '#1e293b',
      headerColor: '#f8fafc',
      fontFamily: 'Inter',
      logoPosition: 'left',
      showWatermark: false,
    },
    visibility: {
      showLogo: true,
      showCompanyRtn: true,
      showAddress: true,
      showPhone: true,
      showCustomerData: true,
      showBacReference: true,
      showQr: true,
      showLegalFooter: true,
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.invoiceTemplate) {
          setTemplate(data.invoiceTemplate);
        }
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error("Permiso denegado");
      return;
    }
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        invoiceTemplate: template,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success("Configuración guardada correctamente");
    } catch (err) {
      toast.error("Error al guardar");
    }
  };

  const updateSection = (section: string, field: string, value: any) => {
    setTemplate((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    const toastId = toast.loading("Generando vista previa PDF...");
    
    try {
      const element = previewRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Fix for oklch colors which html2canvas doesn't support
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el) => {
            const HTMLElement = el as HTMLElement;
            const style = window.getComputedStyle(el);
            
            // Standardize colors to RGB which html2canvas understands
            // We check common properties that might use oklch
            const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'];
            
            colorProps.forEach(prop => {
              const value = style[prop as any];
              if (value && (value.includes('oklch') || value.includes('var('))) {
                HTMLElement.style[prop as any] = value;
              }
              
              // Force computed style application for all elements to be safe
              // getComputedStyle usually returns rgb/rgba even for oklch/vars
              if (value) {
                HTMLElement.style[prop as any] = value;
              }
            });
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'letter'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`preview-${template.config.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast.success("PDF generado con éxito", { id: toastId });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Error al generar el PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personalización de Plantilla</h1>
              <p className="text-slate-500 text-sm">Configura la apariencia y los datos fiscales del PDF de facturación.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl px-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Generando...' : 'Previsualizar PDF'}
              </Button>
              <Button variant="outline" className="rounded-xl px-6">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar
              </Button>
              <Button onClick={handleSave} className="rounded-xl px-6 shadow-lg shadow-primary/20">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Side */}
            <div className="lg:col-span-7">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 mb-6 gap-6">
                  <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-bold">General</TabsTrigger>
                  <TabsTrigger value="empresa" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-bold">Empresa</TabsTrigger>
                  <TabsTrigger value="diseno" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-bold">Diseño</TabsTrigger>
                  <TabsTrigger value="visibilidad" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-bold">Visibilidad</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                  <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardHeader><CardTitle className="text-lg">Configuración General</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Nombre de la Plantilla</Label>
                        <Input value={template.config.name} onChange={(e) => updateSection('config', 'name', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Moneda</Label>
                        <Input value={template.config.currency} onChange={(e) => updateSection('config', 'currency', e.target.value)} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl col-span-2">
                        <div>
                          <p className="font-bold text-slate-800">Plantilla Activa</p>
                          <p className="text-xs text-slate-500">Usar esta configuración para todos los documentos nuevos.</p>
                        </div>
                        <Switch checked={template.config.active} onCheckedChange={(v) => updateSection('config', 'active', v)} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="empresa" className="space-y-6">
                  <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardHeader><CardTitle className="text-lg">Datos de la Empresa</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-2">
                        <Label>Razón Social</Label>
                        <Input value={template.company.legalName} onChange={(e) => updateSection('company', 'legalName', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre Comercial</Label>
                        <Input value={template.company.commercialName} onChange={(e) => updateSection('company', 'commercialName', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>RTN</Label>
                        <Input value={template.company.rtn} onChange={(e) => updateSection('company', 'rtn', e.target.value)} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Dirección</Label>
                        <Input value={template.company.address} onChange={(e) => updateSection('company', 'address', e.target.value)} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="diseno" className="space-y-6">
                  <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardHeader><CardTitle className="text-lg">Identidad Visual</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Color Principal</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="p-1 h-10 w-10 shrink-0" value={template.design.primaryColor} onChange={(e) => updateSection('design', 'primaryColor', e.target.value)} />
                          <Input value={template.design.primaryColor} onChange={(e) => updateSection('design', 'primaryColor', e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2 text-center flex flex-col items-center">
                        <Label>Logo</Label>
                        <div className="mt-2 w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="visibilidad" className="space-y-4">
                   <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardHeader><CardTitle className="text-lg">Elementos Visibles</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {Object.keys(template.visibility).map((key) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <Label className="capitalize font-medium text-slate-700">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <Switch checked={template.visibility[key]} onCheckedChange={(v) => updateSection('visibility', key, v)} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Side */}
            <div className="lg:col-span-5 h-fit sticky top-24">
              <div className="bg-slate-800 p-2 rounded-t-2xl flex items-center justify-between px-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="w-3 h-3" /> Vista Previa Realtime
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                </div>
              </div>
              <div 
                ref={previewRef}
                className="bg-white p-8 shadow-2xl rounded-b-2xl border border-slate-200 min-h-[600px] scale-[0.95] origin-top flex flex-col"
              >
                {/* Header Preview */}
                <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-100">
                  <div className="space-y-1">
                    {template.visibility.showLogo && (
                      <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mb-2">
                        <span className="text-white font-bold">BWP</span>
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 uppercase" style={{ color: template.design.primaryColor }}>{template.company.commercialName}</h3>
                    <p className="text-[10px] font-bold text-slate-500 leading-tight">{template.company.legalName}</p>
                    {template.visibility.showCompanyRtn && <p className="text-[10px] text-slate-400">RTN: {template.company.rtn}</p>}
                    {template.visibility.showAddress && <p className="text-[10px] text-slate-400 max-w-[200px]">{template.company.address}</p>}
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-black text-slate-900 mb-1">FACTURA</h2>
                    <p className="text-xs font-bold text-slate-600">No. 000-001-01-00000045</p>
                    <div className="mt-4 space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">CAI</p>
                      <p className="text-[10px] font-mono font-bold bg-slate-50 p-1 rounded">123456-ABC789-XYZ</p>
                    </div>
                  </div>
                </div>

                {/* Patient / Client Preview */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Cliente</p>
                    <p className="text-xs font-bold text-slate-900">Juan Pérez</p>
                    <p className="text-[10px] text-slate-500">RTN: 0801199500000</p>
                    <p className="text-[10px] text-slate-500">Tegucigalpa, Honduras</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Fecha Emisión</p>
                    <p className="text-xs font-bold text-slate-900">30/04/2026</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">Límite Emisión</p>
                    <p className="text-xs font-bold text-slate-900">30/12/2026</p>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="flex-1">
                  <div className="grid grid-cols-6 text-[10px] font-bold py-2 border-b border-slate-900 uppercase" style={{ color: template.design.primaryColor }}>
                    <span className="col-span-3">Descripción</span>
                    <span className="text-center">Cant.</span>
                    <span className="text-right">Precio</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="grid grid-cols-6 text-[10px] py-3 border-b border-slate-100">
                    <span className="col-span-3 font-medium">Servicio de Alquiler Unit 45</span>
                    <span className="text-center">1</span>
                    <span className="text-right">2,500.00</span>
                    <span className="text-right font-bold">2,500.00</span>
                  </div>
                </div>

                {/* Footer Totals */}
                <div className="mt-8 pt-4 border-t-2 border-slate-100 max-w-[250px] ml-auto space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">Subtotal</span>
                    <span className="font-bold text-slate-900">L 2,500.00</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">ISV (15%)</span>
                    <span className="font-bold text-slate-900">L 375.00</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-black uppercase" style={{ color: template.design.primaryColor }}>Total</span>
                    <span className="font-black text-slate-900 underline underline-offset-4 decoration-primary">L 2,875.00</span>
                  </div>
                </div>

                <div className="mt-12 text-center space-y-2 opacity-50 grayscale">
                  <p className="text-[8px] font-bold italic">&quot;La factura es beneficio de todos, exíjala&quot;</p>
                  {template.visibility.showLegalFooter && <p className="text-[7px] max-w-[300px] mx-auto leading-tight">DOCUMENTO FISCAL AUTORIZADO POR LA SAR - GENERADO POR BWP FISCALPAY INTEGRATOR</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}
