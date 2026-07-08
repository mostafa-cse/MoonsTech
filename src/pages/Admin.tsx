import { Link, Routes, Route, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import Layout from "@/components/Layout";
import ProductsManagement from "./admin/ProductsManagement";
import OrdersManagement from "./admin/OrdersManagement";
import UsersManagement from "./admin/UsersManagement";
import CouponsManagement from "./admin/CouponsManagement";
import BannersManagement from "./admin/BannersManagement";
import SalesAnalytics from "./admin/SalesAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENCY } from "@/const";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  ChevronRight, TrendingUp, AlertTriangle, DollarSign,
   Megaphone, BarChart3
} from "lucide-react";

function AdminSidebar() {
  const location = useLocation();
  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/admin/products", label: "Products", icon: <Package className="w-5 h-5" /> },
    { path: "/admin/orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { path: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { path: "/admin/sales", label: "Sales Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/admin/coupons", label: "Coupons", icon: <Tag className="w-5 h-5" /> },
    { path: "/admin/banners", label: "Banners", icon: <Megaphone className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full md:w-64 shrink-0">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:space-y-1 sticky top-24 flex md:flex-col overflow-x-auto gap-2 md:gap-1 whitespace-nowrap shadow-sm">
        <div className="px-4 py-3 mb-2 hidden md:block">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Admin Panel</p>
        </div>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 font-semibold ${location.pathname === item.path ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <div className={`${location.pathname === item.path ? "text-white" : "text-slate-400"}`}>{item.icon}</div>
            <span className="md:inline">{item.label}</span>
            {location.pathname === item.path && <ChevronRight className="w-4 h-4 ml-auto hidden md:block text-white/70" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/dashboard");
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 glass rounded-[1.5rem] animate-pulse" />)}
        </div>
        <div className="h-64 glass rounded-[1.5rem] animate-pulse" />
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: dashboard?.stats.totalUsers || 0, icon: <Users className="w-6 h-6 text-blue-600" />, color: "bg-blue-50 text-blue-600", borderColor: "bg-blue-500" },
    { label: "Total Products", value: dashboard?.stats.totalProducts || 0, icon: <Package className="w-6 h-6 text-emerald-600" />, color: "bg-emerald-50 text-emerald-600", borderColor: "bg-emerald-500" },
    { label: "Total Orders", value: dashboard?.stats.totalOrders || 0, icon: <ShoppingCart className="w-6 h-6 text-purple-600" />, color: "bg-purple-50 text-purple-600", borderColor: "bg-purple-500" },
    { label: "Revenue", value: `${CURRENCY}${(dashboard?.stats.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="w-6 h-6 text-indigo-600" />, color: "bg-indigo-50 text-indigo-600", borderColor: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardContent className="p-6 flex items-center gap-5 relative h-full">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.borderColor}`} />
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>{stat.icon}</div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800"><TrendingUp className="w-5 h-5 text-indigo-500" /> Top Products</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {dashboard?.topProducts?.length ? dashboard.topProducts.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between group">
                  <p className="text-sm font-medium text-slate-700 truncate flex-1 group-hover:text-indigo-600 transition-colors cursor-default">{p.name}</p>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full ml-3">{p.totalSales} sold</span>
                </div>
              )) : <p className="text-slate-500 text-center py-6 text-sm">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800"><AlertTriangle className="w-5 h-5 text-rose-500" /> Low Stock</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {dashboard?.lowStock?.length ? dashboard.lowStock.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between group">
                  <p className="text-sm font-medium text-slate-700 truncate flex-1 group-hover:text-rose-600 transition-colors cursor-default">{p.name}</p>
                  <Badge variant="destructive" className="text-xs shadow-sm bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-3 py-0.5 rounded-full">{p.stockQuantity} left</Badge>
                </div>
              )) : <p className="text-slate-500 text-center py-6 text-sm">All stocked</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5">
          <CardTitle className="text-base font-bold text-slate-800">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Order #</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Payment</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Total</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboard?.recentOrders?.length ? dashboard.recentOrders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 font-semibold text-slate-900">{order.orderNumber}</td>
                    <td className="py-4 px-6"><Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 capitalize font-medium rounded-md">{order.status}</Badge></td>
                    <td className="py-4 px-6 font-medium text-slate-600 capitalize">{order.paymentMethod}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{CURRENCY}{Number(order.total).toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">No recent orders found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/products" element={<ProductsManagement />} />
              <Route path="/orders" element={<OrdersManagement />} />
              <Route path="/sales" element={<SalesAnalytics />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/coupons" element={<CouponsManagement />} />
              <Route path="/banners" element={<BannersManagement />} />
            </Routes>
          </div>
        </div>
      </div>
    </Layout>
  );
}
