import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY } from "@/const";
import { Eye, MapPin, Phone, User, Package, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: ordersList, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/orders").catch(() => ({ data: [] }));
      return data;
    }
  });
  const { data: orderDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["admin", "orders", selectedOrder?.id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/orders/${selectedOrder?.id}`).catch(() => ({ data: null }));
      return data;
    },
    enabled: !!selectedOrder?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.put(`/admin/orders/${data.orderId}`, data),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update order"),
  });

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (orderId: number, newStatus: any) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handlePaymentStatusChange = (orderId: number, newStatus: any) => {
    updateStatusMutation.mutate({ orderId, paymentStatus: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h2>
          <p className="text-sm text-slate-500 mt-1">Manage, update, and track customer orders.</p>
        </div>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Order #</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Total</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Date</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Payment</th>
                  <th className="text-right py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-medium">Loading orders...</td></tr>
                ) : ordersList?.length ? (
                  ordersList.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-900">{order.orderNumber}</td>
                      <td className="py-4 px-6 font-medium text-slate-700">{CURRENCY}{Number(order.total).toLocaleString()}</td>
                      <td className="py-4 px-6 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <Select 
                          value={order.status} 
                          onValueChange={(v) => handleStatusChange(order.id, v)}
                        >
                          <SelectTrigger className="w-[150px] h-8 text-xs bg-slate-50 border-slate-200 focus:ring-indigo-500 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="ready_to_ship">Ready for Ship</SelectItem>
                            <SelectItem value="handover_to_delivery">Handover to Delivery</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-6 uppercase text-[11px] font-bold text-slate-500 tracking-wider">
                        {order.paymentMethod}
                        <Badge variant="outline" className={`ml-3 capitalize font-medium rounded-md border-0 px-2 py-0.5 ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="ghost" size="icon" aria-label="View Order Details" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenDetails(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Order Details <span className="text-indigo-600">#{selectedOrder?.orderNumber}</span></DialogTitle>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="py-12 text-center text-slate-500 font-medium">Loading details...</div>
          ) : orderDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-6">
                <Card className="shadow-sm border-slate-200 rounded-2xl bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800"><User className="w-4 h-4 text-indigo-500"/> Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3 pt-4">
                    {(() => {
                      let addr = orderDetails.deliveryAddress as any;
                      if (typeof addr === 'string') {
                        try {
                          addr = JSON.parse(addr);
                        } catch (e) {
                          addr = { fullName: "Invalid Address Data", phone: "", fullAddress: addr };
                        }
                      }
                      return (
                        <>
                          <div className="flex gap-3 items-center text-slate-700 font-medium"><User className="w-4 h-4 text-slate-400"/> {addr?.fullName}</div>
                          <div className="flex gap-3 items-center text-slate-700"><Phone className="w-4 h-4 text-slate-400"/> {addr?.phone}</div>
                          <div className="flex gap-3 items-start text-slate-700"><MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0"/> 
                            <span className="leading-relaxed">{addr?.fullAddress}{addr?.thana ? `, ${addr.thana}` : ''}{addr?.district ? `, ${addr.district}` : ''}{addr?.division ? `, ${addr.division}` : ''}</span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 rounded-2xl bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800"><Calendar className="w-4 h-4 text-indigo-500"/> Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment Status</label>
                      <Select 
                        value={orderDetails.status} 
                        onValueChange={(v) => handleStatusChange(orderDetails.id, v)}
                      >
                        <SelectTrigger className="rounded-lg border-slate-200 shadow-sm bg-slate-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="ready_to_ship">Ready for Ship</SelectItem>
                          <SelectItem value="handover_to_delivery">Handover to Delivery</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status</label>
                      <Select 
                        value={orderDetails.paymentStatus || "pending"} 
                        onValueChange={(v) => handlePaymentStatusChange(orderDetails.id, v)}
                      >
                        <SelectTrigger className="rounded-lg border-slate-200 shadow-sm bg-slate-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-sm border-slate-200 rounded-2xl bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800"><Package className="w-4 h-4 text-indigo-500"/> Order Items</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {orderDetails.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1">{item.productName}</p>
                            <p className="text-slate-500 text-xs mt-0.5">SKU: {item.sku} &times; {item.quantity}</p>
                          </div>
                          <p className="font-bold text-slate-900">{CURRENCY}{item.totalPrice}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 space-y-3 text-sm border-t border-slate-100 pt-4">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="text-slate-900">{CURRENCY}{orderDetails.subtotal}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Shipping</span>
                        <span className="text-slate-900">{CURRENCY}{orderDetails.shippingCost}</span>
                      </div>
                      {Number(orderDetails.discountAmount) > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium bg-emerald-50/50 p-2 rounded-lg -mx-2 px-2">
                          <span>Discount</span>
                          <span>-{CURRENCY}{orderDetails.discountAmount}</span>
                        </div>
                      )}
                      {Number(orderDetails.megaCoinDiscount) > 0 && (
                        <div className="flex justify-between text-indigo-600 font-medium bg-indigo-50/50 p-2 rounded-lg -mx-2 px-2">
                          <span>MegaCoins ({orderDetails.megaCoinsUsed})</span>
                          <span>-{CURRENCY}{orderDetails.megaCoinDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-lg pt-4 border-t border-slate-100 text-slate-900">
                        <span>Total</span>
                        <span>{CURRENCY}{orderDetails.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-rose-500 font-medium">Failed to load order details</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
