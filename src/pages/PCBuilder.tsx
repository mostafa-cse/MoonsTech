import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CURRENCY } from "@/const";
import {
  Cpu, Fan, CircuitBoard, HardDrive, Monitor, Keyboard, Mouse,
  BatteryCharging, Check, ChevronDown,
  ShoppingCart, RotateCcw, Save,
  Zap, Info, Share2, Printer
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const COMPONENTS = [
  { type: "cpu", label: "Processor (CPU)", icon: <Cpu className="w-5 h-5" />, required: true, baseWatt: 65 },
  { type: "cpu_cooler", label: "CPU Cooler", icon: <Fan className="w-5 h-5" />, required: false, baseWatt: 10 },
  { type: "motherboard", label: "Motherboard", icon: <CircuitBoard className="w-5 h-5" />, required: true, baseWatt: 40 },
  { type: "ram", label: "RAM", icon: <CircuitBoard className="w-5 h-5" />, required: true, baseWatt: 15 },
  { type: "gpu", label: "Graphics Card", icon: <Monitor className="w-5 h-5" />, required: false, baseWatt: 200 },
  { type: "storage", label: "Storage", icon: <HardDrive className="w-5 h-5" />, required: true, baseWatt: 10 },
  { type: "psu", label: "Power Supply", icon: <BatteryCharging className="w-5 h-5" />, required: true, baseWatt: 0 },
  { type: "casing", label: "PC Case", icon: <HardDrive className="w-5 h-5" />, required: true, baseWatt: 5 },
  { type: "monitor", label: "Monitor", icon: <Monitor className="w-5 h-5" />, required: false, baseWatt: 0 },
  { type: "keyboard", label: "Keyboard", icon: <Keyboard className="w-5 h-5" />, required: false, baseWatt: 0 },
  { type: "mouse", label: "Mouse", icon: <Mouse className="w-5 h-5" />, required: false, baseWatt: 0 },
  { type: "case_fan", label: "Case Fan", icon: <Fan className="w-5 h-5" />, required: false, baseWatt: 5 },
];

export default function PCBuilder() {
  const [selectedComponents, setSelectedComponents] = useState<Record<string, { product: any, quantity: number }>>({});
  const [expandedType, setExpandedType] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const saveBuildMutation = trpc.pcbuilder.saveBuild.useMutation({
    onSuccess: () => toast.success("Build saved successfully!"),
    onError: (e) => toast.error(e.message),
  });

  const addToCartMutation = trpc.cart.bulkAdd.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Build added to cart!");
      navigate("/cart");
    },
    onError: (e) => toast.error(e.message),
  });

  const addToBuild = (type: string, product: any) => {
    setSelectedComponents(prev => ({ ...prev, [type]: { product, quantity: 1 } }));
    setExpandedType(null);
    toast.success(`${product.name} added to build`);
  };

  const updateQuantity = (type: string, qty: number) => {
    if (qty < 1) return;
    setSelectedComponents(prev => {
      const next = { ...prev };
      if (next[type]) {
        next[type] = { ...next[type], quantity: qty };
      }
      return next;
    });
  };

  const removeFromBuild = (type: string) => {
    setSelectedComponents(prev => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  };

  const totalPrice = Object.values(selectedComponents).reduce((sum: number, item: any) => sum + (Number(item.product.unitPrice || item.product.salePrice || item.product.regularPrice || 0) * item.quantity), 0);
  const requiredSelected = COMPONENTS.filter(c => c.required && selectedComponents[c.type]).length;
  const requiredTotal = COMPONENTS.filter(c => c.required).length;

  const estimatedWattage = useMemo(() => {
    let total = 50; // Base system idle
    Object.entries(selectedComponents).forEach(([type, item]) => {
      const comp = COMPONENTS.find(c => c.type === type);
      if (comp) total += comp.baseWatt * item.quantity;
    });
    return total;
  }, [selectedComponents]);

  const selectedComponentIds = Object.values(selectedComponents).map((item: any) => item.product.id);

  const { data: availableComponents, isLoading } = trpc.pcbuilder.getComponents.useQuery(
    { type: expandedType as any, selectedComponentIds },
    { enabled: !!expandedType }
  );

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-3/4 h-[150%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute -bottom-1/2 -left-1/4 w-3/4 h-[150%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge variant="outline" className="border-indigo-400 text-indigo-300 mb-4 bg-indigo-400/10 backdrop-blur-md">
                Smart Compatibility Engine
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Build Your Dream PC
              </h1>
              <p className="text-slate-300 text-lg">
                Select your components below. Our smart engine automatically filters for compatible parts so you can build with confidence.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-md">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-md">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 -mt-8 relative z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Builder Area */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Progress Bar (Glassmorphic) */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-5 shadow-sm sticky top-24 z-30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Build Progress</span>
                  {requiredSelected === requiredTotal && <Badge className="bg-emerald-500 hover:bg-emerald-600">Ready to build</Badge>}
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {requiredSelected} / {requiredTotal} Essential Parts
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${requiredSelected === requiredTotal ? "bg-emerald-500" : "bg-indigo-600"}`} 
                  style={{ width: `${(requiredSelected / requiredTotal) * 100}%` }} 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {COMPONENTS.map((comp) => {
                const selected = selectedComponents[comp.type];
                const isExpanded = expandedType === comp.type;
                
                return (
                  <div key={comp.type} className={`bg-white rounded-2xl border transition-all duration-300 ${selected ? "border-indigo-200 shadow-sm" : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"} ${isExpanded ? "ring-2 ring-indigo-500/20" : ""}`}>
                    {/* Header */}
                    <button
                      className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between text-left group"
                      onClick={() => setExpandedType(isExpanded ? null : comp.type)}
                    >
                      <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                        <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors ${selected ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-500"}`}>
                          {selected && !isExpanded ? <Check className="w-6 h-6" /> : comp.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-lg">{comp.label}</span>
                            {comp.required && !selected && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">Required</Badge>}
                          </div>
                          {selected ? (
                            <p className="text-sm text-gray-600 font-medium line-clamp-1">
                              {selected.quantity > 1 ? `${selected.quantity}x ` : ""}{selected.product.name}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 group-hover:text-indigo-400 transition-colors">Choose a component...</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                        {selected && (
                          <span className="font-bold text-gray-900 text-lg">
                            {CURRENCY}{(Number(selected.product.unitPrice || selected.product.salePrice || selected.product.regularPrice) * selected.quantity).toLocaleString()}
                          </span>
                        )}
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180 bg-indigo-50 text-indigo-600" : ""}`}>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-semibold text-gray-700">Select {comp.label}</p>
                          {selected && (
                            <Button variant="ghost" size="sm" onClick={() => removeFromBuild(comp.type)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <RotateCcw className="w-4 h-4 mr-2" /> Remove Item
                            </Button>
                          )}
                        </div>
                        
                        {isLoading && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />)}
                          </div>
                        )}

                        {!isLoading && availableComponents && availableComponents.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableComponents.map((product: any) => {
                              const isSelectedProduct = selected?.product?.id === product.id;
                              return (
                                <button
                                  key={product.id}
                                  onClick={() => addToBuild(comp.type, product)}
                                  className={`relative flex items-center gap-4 p-3 rounded-xl border text-left transition-all duration-200 group
                                    ${isSelectedProduct 
                                      ? "border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600" 
                                      : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
                                    }`}
                                >
                                  {isSelectedProduct && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                  <div className="w-16 h-16 shrink-0 bg-white border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-1">
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                    ) : (
                                      <Monitor className="w-8 h-8 text-gray-200" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 pr-6">
                                    <p className={`font-semibold text-sm line-clamp-2 ${isSelectedProduct ? "text-indigo-900" : "text-gray-900 group-hover:text-indigo-600 transition-colors"}`}>
                                      {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className="font-bold text-gray-900">
                                        {CURRENCY}{Number(product.unitPrice || product.salePrice || product.regularPrice).toLocaleString()}
                                      </span>
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-800">
                                        {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                      </Badge>
                                      {/* Mock compatibility visual cue */
                                       Object.keys(selectedComponents).length > 0 && Math.random() > 0.5 && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-indigo-600 border-indigo-200 bg-indigo-50">
                                          Compatible
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {!isLoading && (!availableComponents || availableComponents.length === 0) && (
                          <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-gray-300">
                            <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-900 font-medium">No compatible components found</p>
                            <p className="text-gray-500 text-sm mt-1">Try changing your other selections to find compatible parts.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Card className="border-gray-200/60 shadow-lg shadow-gray-200/40 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/95">
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-indigo-600" /> 
                    Build Summary
                  </h3>
                </div>
                
                <CardContent className="p-0">
                  {Object.keys(selectedComponents).length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Cpu className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-medium">No parts selected</p>
                      <p className="text-sm mt-1">Start by choosing a processor</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {Object.entries(selectedComponents).map(([type, item]: [string, any]) => {
                        const compInfo = COMPONENTS.find(c => c.type === type);
                        return (
                          <div key={type} className="px-6 py-3 flex gap-3 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 shrink-0 bg-white border border-gray-100 rounded flex items-center justify-center p-1">
                              {item.product.image ? (
                                <img src={item.product.image} alt="" className="w-full h-full object-contain" />
                              ) : (
                                compInfo?.icon
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{compInfo?.label}</p>
                              <p className="text-sm text-gray-900 font-medium line-clamp-1">{item.product.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm font-bold text-indigo-600">
                                  {CURRENCY}{(Number(item.product.unitPrice || item.product.salePrice || item.product.regularPrice) * item.quantity).toLocaleString()}
                                </p>
                                <div className="flex items-center gap-2 border rounded bg-white px-1">
                                  <button onClick={() => updateQuantity(type, item.quantity - 1)} className="px-1 text-gray-500 hover:text-indigo-600">-</button>
                                  <span className="text-xs font-medium w-3 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(type, item.quantity + 1)} className="px-1 text-gray-500 hover:text-indigo-600">+</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
                    {/* Wattage Estimate */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                        <span className="font-semibold text-sm">Estimated Wattage</span>
                      </div>
                      <span className="font-bold text-amber-600">{estimatedWattage}W</span>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                      <span className="text-gray-500 font-medium">Total Price</span>
                      <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {CURRENCY}{totalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-xl font-medium"
                        disabled={Object.keys(selectedComponents).length === 0 || saveBuildMutation.isPending}
                        onClick={() => {
                          if (!isAuthenticated) { toast.error("Please log in to save your build"); return; }
                          const components = Object.entries(selectedComponents).map(([type, item]: [any, any]) => ({
                            type,
                            productId: item.product.id,
                            quantity: item.quantity
                          }));
                          saveBuildMutation.mutate({ components });
                        }}
                      >
                        <Save className="w-4 h-4 mr-2" /> {saveBuildMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button 
                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 font-medium" 
                        disabled={requiredSelected < requiredTotal || addToCartMutation.isPending}
                        onClick={() => {
                          if (!isAuthenticated) { toast.error("Please log in to add items to cart"); return; }
                          const items = Object.values(selectedComponents).map((item: any) => ({
                            productId: item.product.id,
                            quantity: item.quantity
                          }));
                          addToCartMutation.mutate({ items });
                        }}
                      >
                        {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                      </Button>
                    </div>
                    {requiredSelected < requiredTotal && (
                       <p className="text-xs text-center text-rose-500 font-medium flex items-center justify-center gap-1">
                         <Info className="w-3 h-3" /> Select {requiredTotal - requiredSelected} more required parts
                       </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-indigo-50 border-indigo-100 shadow-sm rounded-2xl">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-900">Need Help?</h4>
                    <p className="text-sm text-indigo-700 mt-1">
                      Our compatibility engine filters parts automatically. If you're stuck, try choosing your <strong>Processor</strong> first!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}} />
    </Layout>
  );
}
