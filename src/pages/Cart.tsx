import { Link, useNavigate } from "react-router";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { CURRENCY } from "@/const";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, PackageOpen, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cart");
      return data;
    },
    enabled: isAuthenticated,
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  const updateQuantity = useMutation({
    mutationFn: async (data: any) => await apiClient.put("/cart/update-quantity", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: any) => toast.error("Failed to update quantity"),
  });
  const removeItem = useMutation({
    mutationFn: async ({ itemId }: { itemId: string }) => await apiClient.delete(`/cart/remove/${itemId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cart"] }); toast.success("Item removed"); },
    onError: (e: any) => toast.error("Failed to remove item"),
  });
  const clearCart = useMutation({
    mutationFn: async () => await apiClient.post("/cart/clear"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cart"] }); toast.success("Cart cleared"); },
    onError: (e: any) => toast.error("Failed to clear cart"),
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data: result } = await apiClient.post("/coupon/validate", { code: couponCode, orderAmount: Number(cart?.subtotal || 0) });
      if (result.valid && result.coupon) {
        const coupon = result.coupon;
        setAppliedCoupon(coupon);
        if (coupon.discountType === "percentage") {
          const disc = (Number(cart?.subtotal || 0) * Number(coupon.discountValue)) / 100;
          setDiscount(Math.min(disc, Number(coupon.maximumDiscount || Infinity)));
        } else if (coupon.discountType === "fixed_amount") {
          setDiscount(Number(coupon.discountValue));
        }
        toast.success("Coupon applied!");
      } else {
        toast.error(result.message || "Invalid coupon");
      }
    } catch {
      toast.error("Invalid coupon code");
    }
  };

  const isFreeShipping = appliedCoupon?.discountType === "free_shipping";
  const shippingCost = isFreeShipping ? 0 : (Number(cart?.subtotal || 0) > 5000 ? 0 : 60);
  const finalTotal = Number(cart?.subtotal || 0) + shippingCost - discount;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please log in to view your cart</h1>
          <p className="text-gray-500 mb-6">You need an account to add items to the cart and checkout.</p>
          <div className="flex justify-center gap-4">
            <Link to="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline">Browse Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageOpen className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Looks like you haven't added any items to your cart yet. Discover our amazing products!</p>
            <Link to="/products">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 shadow-md shadow-indigo-200 rounded-xl text-md font-medium">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Shopping Cart ({cart.itemCount} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <Card key={item.id} className="overflow-hidden border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <Link to={`/product/${item.slug}`} className="w-full sm:w-28 h-32 sm:h-28 shrink-0 bg-gray-50 rounded-xl overflow-hidden relative group block">
                      {item.image ? (
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50/50">
                          <PackageOpen className="w-8 h-8" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link to={`/product/${item.slug}`}>
                            <h3 className="font-bold text-gray-900 hover:text-indigo-600 line-clamp-2 text-lg leading-tight transition-colors">{item.name}</h3>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1.5 font-medium">SKU: {item.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove item"
                          className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 h-8 w-8 transition-colors -mt-1 -mr-1"
                          onClick={() => removeItem.mutate({ itemId: item.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-lg h-9 bg-white">
                          <button
                            onClick={() => item.quantity > 1 && updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                            className="px-3 h-full hover:bg-gray-50 disabled:opacity-50 transition-colors text-gray-500 rounded-l-lg flex items-center justify-center"
                            disabled={item.quantity <= 1 || updateQuantity.isPending}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                            className="px-3 h-full hover:bg-gray-50 transition-colors text-gray-500 rounded-r-lg flex items-center justify-center"
                            disabled={updateQuantity.isPending}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-indigo-600 leading-none">{CURRENCY}{Number(item.totalPrice).toLocaleString()}</p>
                          <p className="text-xs text-gray-400 font-medium mt-1">{CURRENCY}{Number(item.unitPrice).toLocaleString()} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Link to="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              <Button variant="outline" className="text-red-500" onClick={() => clearCart.mutate()}>Clear Cart</Button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 border-indigo-100/50 bg-gradient-to-br from-indigo-50/30 to-white backdrop-blur-sm rounded-3xl shadow-lg shadow-indigo-100/20">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-extrabold text-gray-900">Order Summary</h2>

                {/* Coupon */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Discount Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="uppercase bg-white border-gray-200 h-11"
                    />
                    <Button onClick={handleApplyCoupon} className="h-11 px-5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl mt-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-bold">{appliedCoupon.code} applied</span>
                      </div>
                      <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(""); }} className="text-rose-500 hover:text-rose-700 text-sm font-medium transition-colors">Remove</button>
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-200/60" />

                <div className="space-y-4 text-[15px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900">{CURRENCY}{Number(cart.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className="font-bold text-gray-900">{shippingCost === 0 ? <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">FREE</span> : `${CURRENCY}${shippingCost}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">-{CURRENCY}{discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-200/60" />

                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-black text-indigo-600 tracking-tight">{CURRENCY}{finalTotal.toLocaleString()}</span>
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg rounded-xl shadow-md shadow-indigo-200 mt-2"
                  onClick={() => navigate("/checkout", { state: { cart, discount, couponCode, shippingCost, finalTotal } })}
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="bg-blue-50/50 rounded-xl p-3 flex items-center justify-center gap-2 text-blue-700 mt-4 border border-blue-100/50">
                  <ShieldCheck className="w-4 h-4" />
                  <p className="text-xs font-medium text-center">Secure checkout powered by SSL</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
