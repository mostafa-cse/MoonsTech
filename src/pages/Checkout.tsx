import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CURRENCY } from "@/const";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { CreditCard, Truck, Wallet, MapPin, ChevronLeft, CheckCircle2, Zap, Smartphone, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

const DIVISIONS = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cart");
      return data;
    },
    enabled: isAuthenticated
  });
  
  const stateData = location.state || {};
  const couponCode = stateData.couponCode;
  const discount = stateData.discount || 0;
  
  const cart = cartData || stateData.cart;
  const shippingCost = stateData.shippingCost !== undefined ? stateData.shippingCost : (Number(cart?.subtotal || 0) > 5000 ? 0 : 60);
  const finalTotal = stateData.finalTotal !== undefined ? stateData.finalTotal : (Number(cart?.subtotal || 0) + shippingCost - discount);

  const isGuest = !user;
  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await apiClient.get("/address");
      return data;
    },
    enabled: isAuthenticated
  });
  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/order", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Order placed! Order #${data.orderNumber}`);
      navigate("/account/orders");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to place order"),
    onSettled: () => setIsProcessing(false),
  });

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "", phone: "", division: "", district: "", thana: "", fullAddress: "", landmark: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("home_delivery");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (isCartLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl">Loading checkout...</h1>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
          <Button onClick={() => navigate("/cart")} className="bg-indigo-600">Go to Cart</Button>
        </div>
      </Layout>
    );
  }

  const handlePlaceOrder = async () => {
    const addressId = selectedAddress || -1;
    if (addressId === -1 && (!newAddress.fullName || !newAddress.phone || !newAddress.division || !newAddress.fullAddress)) {
      toast.error("Please fill in your complete delivery address");
      return;
    }

    setIsProcessing(true);

    // If logged in but no saved address selected, require them to select/create one
    const actualAddressId = selectedAddress || (addresses?.[0]?.id);
    if (!isGuest && !actualAddressId && (!newAddress.fullName || !newAddress.phone)) {
      toast.error("Please select a delivery address or fill out a new one");
      setIsProcessing(false);
      return;
    }

    if (isGuest && (!newAddress.fullName || !newAddress.phone || !newAddress.fullAddress)) {
      toast.error("Please fill in your complete delivery address");
      setIsProcessing(false);
      return;
    }

    const payload: any = {
      paymentMethod: paymentMethod as any,
      deliveryMethod: deliveryMethod as any,
      couponCode: couponCode || undefined,
      megaCoinsToUse: 0,
      items: cart.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal: cart.subtotal,
      shippingCost: shippingCost.toString(),
      discountAmount: discount?.toString(),
      total: finalTotal.toString(),
    };

    if (!isGuest && actualAddressId) {
      payload.addressId = actualAddressId;
      const addr = addresses?.find((a: any) => a.id === actualAddressId);
      if (addr) {
        payload.deliveryAddress = JSON.stringify(addr);
      }
    } else {
      payload.guestAddress = newAddress;
      payload.deliveryAddress = JSON.stringify(newAddress);
    }

    createOrder.mutate(payload);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Progress */}
        <div className="flex items-center justify-center mb-12">
          {["Shipping", "Payment", "Review"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors duration-300 shadow-sm ${step > i + 1 ? "bg-emerald-500 text-white shadow-emerald-200" : step === i + 1 ? "bg-indigo-600 text-white shadow-indigo-200 ring-4 ring-indigo-50" : "bg-white text-gray-400 border-2 border-gray-100"}`}>
                  {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`absolute top-12 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${step === i + 1 ? "text-indigo-600" : step > i + 1 ? "text-emerald-600" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < 2 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-colors duration-300 ${step > i + 1 ? "bg-emerald-500" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><MapPin className="w-6 h-6 text-indigo-600" /> Delivery Address</h2>

                {addresses && addresses.length > 0 && (
                  <div className="space-y-3">
                    {addresses.map((addr: any) => (
                      <Card
                        key={addr.id}
                        className={`cursor-pointer transition-all duration-200 ${selectedAddress === addr.id ? "border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-600" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"}`}
                        onClick={() => setSelectedAddress(addr.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-gray-900 text-lg">{addr.fullName}</span>
                                {addr.isDefault && <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Default</span>}
                              </div>
                              <p className="text-sm font-medium text-gray-600 mb-2">{addr.phone}</p>
                              <p className="text-sm text-gray-500 leading-relaxed">{addr.fullAddress}, {addr.thana}, {addr.district}, {addr.division}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedAddress === addr.id ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                              {selectedAddress === addr.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
                    <h3 className="font-bold text-gray-900">{isGuest ? "Enter Your Delivery Details" : "Add New Address"}</h3>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label>Full Name</Label>
                        <Input value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                      </div>
                      <div>
                        <Label>Division</Label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          value={newAddress.division}
                          onChange={(e) => setNewAddress({ ...newAddress, division: e.target.value })}
                        >
                          <option value="">Select</option>
                          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>District</Label>
                        <Input value={newAddress.district} onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })} />
                      </div>
                      <div>
                        <Label>Thana</Label>
                        <Input value={newAddress.thana} onChange={(e) => setNewAddress({ ...newAddress, thana: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <Label>Full Address</Label>
                        <Input value={newAddress.fullAddress} onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button className="bg-indigo-600" onClick={() => setStep(2)} disabled={!selectedAddress && !newAddress.fullName}>
                    Continue <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><CreditCard className="w-6 h-6 text-indigo-600" /> Payment Method</h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {[
                    { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive the product", icon: <Wallet className="w-6 h-6" /> },
                    { value: "bkash", label: "bKash", desc: "Pay securely via bKash app", icon: <Smartphone className="w-6 h-6" /> },
                    { value: "nagad", label: "Nagad", desc: "Pay securely via Nagad app", icon: <Smartphone className="w-6 h-6" /> },
                    { value: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex", icon: <CreditCard className="w-6 h-6" /> },
                  ].map((method) => (
                    <Card key={method.value} className={`cursor-pointer transition-all duration-200 ${paymentMethod === method.value ? "border-indigo-600 bg-indigo-50/30 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-600" : "border-gray-200 hover:border-indigo-300"}`}>
                      <CardContent className="p-5">
                        <label className="flex items-center gap-5 cursor-pointer w-full">
                          <RadioGroupItem value={method.value} className="mt-1" />
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === method.value ? "bg-indigo-600 text-white shadow-inner" : "bg-gray-100 text-gray-500"}`}>
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-lg">{method.label}</p>
                            <p className="text-sm text-gray-500 font-medium">{method.desc}</p>
                          </div>
                        </label>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>

                <Separator className="bg-gray-200" />

                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-indigo-600" /> Delivery Method</h3>
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-3">
                    {[
                      { value: "home_delivery", label: "Standard Delivery", desc: `1-3 business days${shippingCost > 0 ? ` - ${CURRENCY}${shippingCost}` : " - FREE"}`, icon: <Truck className="w-6 h-6" /> },
                      { value: "express_delivery", label: "Express Delivery", desc: "Same day within Dhaka - Additional charge", icon: <Zap className="w-6 h-6" /> },
                    ].map((method) => (
                      <Card key={method.value} className={`cursor-pointer transition-all duration-200 ${deliveryMethod === method.value ? "border-emerald-600 bg-emerald-50/30 shadow-md shadow-emerald-100/50 ring-1 ring-emerald-600" : "border-gray-200 hover:border-emerald-300"}`}>
                        <CardContent className="p-5">
                          <label className="flex items-center gap-5 cursor-pointer w-full">
                            <RadioGroupItem value={method.value} className="mt-1" />
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${deliveryMethod === method.value ? "bg-emerald-600 text-white shadow-inner" : "bg-gray-100 text-gray-500"}`}>
                              {method.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">{method.label}</p>
                              <p className="text-sm text-gray-500 font-medium">{method.desc}</p>
                            </div>
                          </label>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 mt-8">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900 h-12 px-6 rounded-xl font-medium"><ChevronLeft className="w-5 h-5 mr-2" /> Back to Shipping</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 h-12 px-8 rounded-xl font-medium" onClick={() => setStep(3)}>Review Order <ChevronLeft className="w-5 h-5 ml-2 rotate-180" /></Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-indigo-600" /> Review Your Order</h2>

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Items in Order ({cart.items.length})</h3>
                    <span className="text-sm font-medium text-gray-500">Total: {CURRENCY}{Number(cart.subtotal).toLocaleString()}</span>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {cart.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200/50">
                            {item.image ? <ImageWithFallback src={item.image} alt={item.productName || item.name || "Product image"} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400"><PackageOpen className="w-6 h-6" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-gray-900 truncate mb-1">{item.name}</p>
                            <p className="text-sm font-medium text-gray-500">Qty: {item.quantity} × {CURRENCY}{Number(item.unitPrice).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-indigo-600 text-lg">{CURRENCY}{Number(item.totalPrice).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4 border-t border-gray-100 mt-8">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-900 h-12 px-6 rounded-xl font-medium"><ChevronLeft className="w-5 h-5 mr-2" /> Back to Payment</Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 h-12 px-8 rounded-xl font-medium"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || createOrder.isPending}
                  >
                    {createOrder.isPending ? "Placing Order..." : `Place Order - ${CURRENCY}${finalTotal.toLocaleString()}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-24 border-indigo-100/50 bg-gradient-to-br from-indigo-50/30 to-white backdrop-blur-sm rounded-3xl shadow-lg shadow-indigo-100/20">
              <CardContent className="p-6 sm:p-8 space-y-5">
                <h3 className="font-extrabold text-xl text-gray-900">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-gray-600 font-medium">Subtotal <span className="text-gray-400 text-sm">({cart.itemCount} items)</span></span>
                    <span className="font-bold text-gray-900">{CURRENCY}{Number(cart.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className="font-bold text-gray-900">{shippingCost === 0 ? <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">FREE</span> : `${CURRENCY}${shippingCost}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[15px] text-emerald-600">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">-{CURRENCY}{discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <Separator className="bg-gray-200/60" />
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="text-3xl font-black text-indigo-600 tracking-tight">{CURRENCY}{finalTotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
