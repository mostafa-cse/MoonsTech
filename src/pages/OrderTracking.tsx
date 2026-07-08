import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, Search, Clock, Box } from "lucide-react";
import { CURRENCY } from "@/const";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["order", "track", orderNumber, phone],
    queryFn: async () => {
      const { data } = await apiClient.post("/order/track", { orderNumber, phone });
      return data;
    },
    enabled: false,
    retry: false
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) return;
    setHasSearched(true);
    refetch();
  };

  const statusMap = {
    pending: { label: "Pending", icon: <Clock className="w-5 h-5" />, color: "bg-yellow-500", step: 1 },
    confirmed: { label: "Confirmed", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-blue-500", step: 2 },
    processing: { label: "Processing", icon: <Box className="w-5 h-5" />, color: "bg-indigo-500", step: 2 },
    ready_to_ship: { label: "Ready to Ship", icon: <Package className="w-5 h-5" />, color: "bg-purple-500", step: 3 },
    handover_to_delivery: { label: "Handed to Courier", icon: <Truck className="w-5 h-5" />, color: "bg-orange-500", step: 3 },
    in_transit: { label: "In Transit", icon: <Truck className="w-5 h-5" />, color: "bg-orange-500", step: 3 },
    out_for_delivery: { label: "Out for Delivery", icon: <Truck className="w-5 h-5" />, color: "bg-emerald-500", step: 4 },
    delivered: { label: "Delivered", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-green-600", step: 5 },
    cancelled: { label: "Cancelled", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-red-500", step: 0 },
    returned: { label: "Returned", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-gray-500", step: 0 },
  };

  const getStatusInfo = (status: string) => {
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const currentStep = order ? getStatusInfo(order.status).step : 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter your order number and phone number to see the latest updates.</p>
        </div>

        <Card className="glass border-0 shadow-xl shadow-indigo-900/5 rounded-[2rem] overflow-hidden mb-8">
          <CardContent className="p-8">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="orderNumber" className="text-sm font-semibold text-gray-700">Order Number</Label>
                <Input
                  id="orderNumber"
                  placeholder="e.g. ORD-1718029202"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="bg-white/50 border-gray-200 h-12 rounded-xl focus-visible:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 01700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/50 border-gray-200 h-12 rounded-xl focus-visible:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isLoading} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-full md:w-auto">
                  {isLoading ? "Tracking..." : <><Search className="w-4 h-4 mr-2" /> Track Order</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {hasSearched && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-500">Locating your order...</p>
              </div>
            ) : isError ? (
              <Card className="glass bg-rose-50/50 border-0 shadow-sm rounded-[2rem]">
                <CardContent className="p-8 text-center">
                  <p className="text-rose-600 font-medium">{error?.message || "Order not found. Please check your details."}</p>
                </CardContent>
              </Card>
            ) : order ? (
              <div className="space-y-6">
                <Card className="glass border-0 shadow-lg rounded-[2rem] overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Order Number</p>
                      <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-100 text-sm font-medium">Order Total</p>
                      <h2 className="text-2xl font-bold">{CURRENCY}{Number(order.total).toLocaleString()}</h2>
                    </div>
                  </div>
                  
                  <CardContent className="p-8 space-y-10">
                    {/* Progress Bar */}
                    {(order.status !== 'cancelled' && order.status !== 'returned') ? (
                      <div className="relative pt-8 pb-4">
                        <div className="absolute top-12 left-0 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                            style={{ width: `${(Math.max(1, currentStep) - 1) * 25}%` }}
                          />
                        </div>
                        
                        <div className="relative flex justify-between">
                          {[
                            { step: 1, label: "Placed" },
                            { step: 2, label: "Confirmed" },
                            { step: 3, label: "Shipped" },
                            { step: 4, label: "Out for Delivery" },
                            { step: 5, label: "Delivered" }
                          ].map((s) => {
                            const isCompleted = currentStep >= s.step;
                            const isCurrent = currentStep === s.step;
                            return (
                              <div key={s.step} className="flex flex-col items-center relative z-10 w-24 -ml-12 first:ml-0 last:-mr-12">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 border-2 ${
                                  isCompleted 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "bg-white border-gray-200 text-gray-300"
                                } ${isCurrent ? "ring-4 ring-indigo-100" : ""}`}>
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                                </div>
                                <span className={`mt-3 text-xs font-semibold text-center ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-center font-bold">
                        This order has been {order.status}.
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                      {/* Status History */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-6">Tracking History</h3>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                          {order.statusHistory?.map((history: any, index: number) => {
                            const info = getStatusInfo(history.status);
                            return (
                              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${info.color} text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                                  {info.icon}
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl glass border border-gray-100/50 shadow-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{info.label}</h4>
                                    <time className="text-xs text-gray-500">{new Date(history.createdAt).toLocaleString()}</time>
                                  </div>
                                  {history.notes && <p className="text-sm text-gray-600">{history.notes}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4">Items in Order</h3>
                        <div className="space-y-3">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 border border-gray-100/50">
                              <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                                <ImageWithFallback src={item.productImage || 'https://placehold.co/100x100?text=No+Image'} alt={item.productName} className="w-full h-full object-contain p-1" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.productName}</p>
                                <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-indigo-600">{CURRENCY}{Number(item.totalPrice).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
}
