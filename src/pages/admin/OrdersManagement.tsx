import { useState } from "react";
import { trpc } from "@/providers/trpc";
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
  
  const utils = trpc.useUtils();
  const { data: ordersList, isLoading } = trpc.order.list.useQuery({ limit: 50 });
  const { data: orderDetails, isLoading: detailsLoading } = trpc.order.getById.useQuery(
    { id: selectedOrder?.id },
    { enabled: !!selectedOrder?.id }
  );

  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.order.list.invalidate();
      if (selectedOrder) utils.order.getById.invalidate({ id: selectedOrder.id });
    },
    onError: (err: any) => toast.error(err.message),
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Orders</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Order #</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Payment</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : ordersList?.length ? (
                  ordersList.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{order.orderNumber}</td>
                      <td className="py-2 px-4 font-medium">{CURRENCY}{Number(order.total).toLocaleString()}</td>
                      <td className="py-2 px-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4">
                        <Select 
                          value={order.status} 
                          onValueChange={(v) => handleStatusChange(order.id, v)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                      <td className="py-2 px-4 uppercase text-xs">
                        {order.paymentMethod} - 
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'} className="ml-2">
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDetails(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="py-8 text-center">Loading details...</div>
          ) : orderDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4"/> Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
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
                          <div className="flex gap-2"><User className="w-4 h-4 text-gray-400"/> {addr?.fullName}</div>
                          <div className="flex gap-2"><Phone className="w-4 h-4 text-gray-400"/> {addr?.phone}</div>
                          <div className="flex gap-2 items-start"><MapPin className="w-4 h-4 text-gray-400 mt-1"/> 
                            <span>{addr?.fullAddress}{addr?.thana ? `, ${addr.thana}` : ''}{addr?.district ? `, ${addr.district}` : ''}{addr?.division ? `, ${addr.division}` : ''}</span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4"/> Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">Fulfillment Status</label>
                      <Select 
                        value={orderDetails.status} 
                        onValueChange={(v) => handleStatusChange(orderDetails.id, v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                      <label className="text-xs font-medium text-gray-500">Payment Status</label>
                      <Select 
                        value={orderDetails.paymentStatus || "pending"} 
                        onValueChange={(v) => handlePaymentStatusChange(orderDetails.id, v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4"/> Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderDetails.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium line-clamp-1">{item.productName}</p>
                            <p className="text-gray-500 text-xs">SKU: {item.sku} × {item.quantity}</p>
                          </div>
                          <p className="font-medium">{CURRENCY}{item.totalPrice}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 space-y-2 text-sm border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>{CURRENCY}{orderDetails.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span>{CURRENCY}{orderDetails.shippingCost}</span>
                      </div>
                      {Number(orderDetails.discountAmount) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-{CURRENCY}{orderDetails.discountAmount}</span>
                        </div>
                      )}
                      {Number(orderDetails.megaCoinDiscount) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>MegaCoins ({orderDetails.megaCoinsUsed})</span>
                          <span>-{CURRENCY}{orderDetails.megaCoinDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <span>Total</span>
                        <span>{CURRENCY}{orderDetails.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-red-500">Failed to load order details</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
