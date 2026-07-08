import { useState } from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CURRENCY } from "@/const";
import {
  User, Package, MapPin, Coins, Heart, ChevronRight,
  LogOut, ShoppingBag, Clock, Truck as TruckIcon, CheckCircle2, XCircle, CreditCard, PackageOpen, Plus, Minus
} from "lucide-react";
import { toast } from "sonner";

function AccountSidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const menuItems = [
    { path: "/account", label: "Dashboard", icon: <User className="w-4 h-4" /> },
    { path: "/account/orders", label: "My Orders", icon: <Package className="w-4 h-4" /> },
    { path: "/account/addresses", label: "Addresses", icon: <MapPin className="w-4 h-4" /> },
    { path: "/account/megacoin", label: "MegaCoin", icon: <Coins className="w-4 h-4" /> },
    { path: "/account/wishlist", label: "Wishlist", icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full lg:w-72 shrink-0">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 p-5 space-y-2 sticky top-24 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-4">Account Menu</h3>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap lg:whitespace-normal ${location.pathname === item.path ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"}`}
            >
              <div className={location.pathname === item.path ? "text-white" : "text-gray-400"}>{item.icon}</div>
              {item.label}
              <ChevronRight className={`w-4 h-4 ml-auto hidden lg:block ${location.pathname === item.path ? "text-indigo-200" : "opacity-0 group-hover:opacity-100 transition-opacity"}`} />
            </Link>
          ))}
          <div className="hidden lg:block"><Separator className="my-3 bg-gray-100" /></div>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-600 hover:bg-rose-50 w-full transition-colors font-medium whitespace-nowrap lg:whitespace-normal">
            <LogOut className="w-4 h-4 text-rose-500" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { data: ordersData } = useQuery({
    queryKey: ["orders", "my"],
    queryFn: async () => {
      const { data } = await apiClient.get("/order/my-orders");
      return data;
    }
  });
  const { data: megaCoinData } = useQuery({
    queryKey: ["megacoins", "my"],
    queryFn: async () => {
      const { data } = await apiClient.get("/megacoin");
      return data;
    }
  });

  const recentOrders = ordersData?.items?.slice(0, 5) || [];

  const stats = [
    { label: "Total Orders", value: ordersData?.totalCount || 0, icon: <ShoppingBag className="w-5 h-5 text-indigo-600" />, color: "bg-indigo-50" },
    { label: "MegaCoin Balance", value: megaCoinData?.balance || 0, icon: <Coins className="w-5 h-5 text-yellow-600" />, color: "bg-yellow-50" },
    { label: "Wishlist Items", value: 0, icon: <Heart className="w-5 h-5 text-red-600" />, color: "bg-red-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl p-6 sm:p-8 flex items-center gap-6 border border-indigo-100/30">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-200 rotate-3">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user?.name}</h2>
          <p className="text-gray-500 font-medium">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-gray-100 bg-white/60 backdrop-blur-sm rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center shadow-inner`}>{stat.icon}</div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white/80 backdrop-blur-sm">
        <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /> Recent Orders</h3>
          <Link to="/account/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
        </div>
        <CardContent className="p-0">
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm font-medium text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6">
                    <Badge variant={order.status === "delivered" ? "default" : "secondary"} className={`capitalize ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}`}>
                      {order.status}
                    </Badge>
                    <span className="font-black text-gray-900 text-lg">{CURRENCY}{Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title="No orders yet"
              description="When you place orders, they will appear here."
              actionText="Start Shopping"
              actionHref="/products"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Orders() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", "my"],
    queryFn: async () => {
      const { data } = await apiClient.get("/order/my-orders");
      return data;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <TruckIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><Package className="w-6 h-6 text-indigo-600" /> My Orders</h2>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : ordersData?.items && ordersData.items.length > 0 ? (
        <div className="space-y-4">
          {ordersData.items.map((order: any) => (
            <Card key={order.id} className="border-gray-100 rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                      <p className="text-sm font-medium text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-indigo-600 text-xl">{CURRENCY}{Number(order.total).toLocaleString()}</span>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{order.items?.length || 0} items</p>
                  </div>
                </div>
                <div className="bg-gray-50/50 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className={`capitalize font-bold border-0 ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>{order.status}</Badge>
                    <Badge variant="outline" className="capitalize bg-white font-medium text-gray-600"><CreditCard className="w-3 h-3 mr-1 inline" /> {order.paymentMethod}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl h-9">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title="No orders found"
          description="When you place an order, it will appear here."
          actionText="Start Shopping"
          actionHref="/products"
        />
      )}
    </div>
  );
}

function Addresses() {
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await apiClient.get("/address");
      return data;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "", division: "", district: "", thana: "", fullAddress: "", landmark: "" });
  const createAddress = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/address", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["addresses"] }); setShowForm(false); toast.success("Address added"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><MapPin className="w-6 h-6 text-indigo-600" /> My Addresses</h2>
        <Button className={`rounded-xl shadow-sm ${showForm ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-indigo-600 hover:bg-indigo-700"}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add New Address"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-indigo-100 shadow-md shadow-indigo-100/20 bg-indigo-50/10 rounded-3xl overflow-hidden">
          <div className="bg-white/50 border-b border-indigo-100 px-6 py-4">
            <h3 className="font-bold text-gray-900">Add New Address</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="font-semibold text-gray-700">Full Name</Label>
                <Input className="mt-1 bg-white h-11" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Phone</Label>
                <Input className="mt-1 bg-white h-11" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Division</Label>
                <Input className="mt-1 bg-white h-11" value={formData.division} onChange={(e) => setFormData({ ...formData, division: e.target.value })} />
              </div>
              <div>
                <Label className="font-semibold text-gray-700">District</Label>
                <Input className="mt-1 bg-white h-11" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Thana</Label>
                <Input className="mt-1 bg-white h-11" value={formData.thana} onChange={(e) => setFormData({ ...formData, thana: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label className="font-semibold text-gray-700">Full Address</Label>
                <Input className="mt-1 bg-white h-11" value={formData.fullAddress} onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label className="font-semibold text-gray-700">Landmark (Optional)</Label>
                <Input className="mt-1 bg-white h-11" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-xl shadow-md shadow-indigo-200" onClick={() => createAddress.mutate(formData)} disabled={createAddress.isPending}>
                {createAddress.isPending ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
      ) : addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr: any) => (
            <Card key={addr.id} className="border-gray-100 rounded-3xl bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {addr.isDefault && <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Default</span>}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-lg">{addr.fullName}</span>
                    <p className="text-sm font-medium text-gray-500">{addr.phone}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{addr.fullAddress}, {addr.thana}, {addr.district}, {addr.division}</p>
                  {addr.landmark && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Landmark: {addr.landmark}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10" />
          </div>
          <p className="text-lg font-bold text-gray-900">No addresses found</p>
          <p className="text-gray-500 mt-2">Add an address to speed up your checkout.</p>
        </div>
      )}
    </div>
  );
}

function MegaCoin() {
  const { data, isLoading } = useQuery({
    queryKey: ["megacoins", "my"],
    queryFn: async () => {
      const { data } = await apiClient.get("/megacoin");
      return data;
    }
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><Coins className="w-6 h-6 text-yellow-500" /> MegaCoin Wallet</h2>

      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl overflow-hidden border-0 shadow-lg shadow-indigo-200 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>
        <CardContent className="p-8 sm:p-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-indigo-200 font-medium uppercase tracking-wider text-sm mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-black">{isLoading ? "..." : (data?.balance || 0)}</p>
                <span className="text-xl font-semibold text-indigo-200">MC</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Coins className="w-12 h-12 text-yellow-400 drop-shadow-md" />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between text-sm text-indigo-100">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> 1 MC = {CURRENCY}{data?.conversionRate || 0.1}</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Min Redeem: {data?.minimumRedeem || 100} MC</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
        </div>
        <CardContent className="p-0">
          {data?.transactions && data.transactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === "earn" || tx.type === "bonus" || tx.type === "referral" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {tx.type === "earn" || tx.type === "bonus" || tx.type === "referral" ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{tx.description}</p>
                      <p className="text-sm font-medium text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-black text-xl ${tx.type === "earn" || tx.type === "bonus" || tx.type === "referral" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "earn" || tx.type === "bonus" || tx.type === "referral" ? "+" : "-"}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Wishlist() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await apiClient.get("/wishlist");
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><Heart className="w-6 h-6 text-rose-500" /> My Wishlist</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item: any) => (
            <Link to={`/product/${item.slug}`} key={item.id} className="group block h-full">
              <Card className="h-full border-gray-100 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 relative">
                    {item.image ? (
                      <ImageWithFallback src={item.image} alt={item.productName || item.name || "Product image"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><PackageOpen className="w-10 h-10" /></div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 shadow-sm">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors flex-1">{item.name}</h3>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-xl font-black text-indigo-600">{CURRENCY}{Number(item.salePrice || item.regularPrice).toLocaleString()}</p>
                      <Badge variant={item.stockStatus === "in_stock" ? "outline" : "secondary"} className={`border-0 ${item.stockStatus === 'in_stock' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="w-12 h-12" />}
          title="Your wishlist is empty"
          description="Save items you love to review them later."
          actionText="Explore Products"
          actionHref="/products"
        />
      )}
    </div>
  );
}

export default function Account() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Layout><div className="flex h-[50vh] items-center justify-center">Loading...</div></Layout>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <AccountSidebar />
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/megacoin" element={<MegaCoin />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </div>
        </div>
      </div>
    </Layout>
  );
}
