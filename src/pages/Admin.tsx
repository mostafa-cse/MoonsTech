import { Link, Routes, Route, useLocation } from "react-router";
import { trpc } from "@/providers/trpc";
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
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: "/admin/products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { path: "/admin/orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
    { path: "/admin/users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { path: "/admin/sales", label: "Sales Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { path: "/admin/coupons", label: "Coupons", icon: <Tag className="w-4 h-4" /> },
    { path: "/admin/banners", label: "Banners", icon: <Megaphone className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full md:w-64 shrink-0">
      <div className="glass rounded-[1.5rem] p-3 md:p-5 md:space-y-1 sticky top-24 flex md:flex-col overflow-x-auto gap-2 md:gap-0 whitespace-nowrap">
        <div className="px-3 py-2 mb-3 hidden md:block">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
        </div>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl text-sm transition-all duration-200 font-medium ${location.pathname === item.path ? "bg-indigo-50/80 text-indigo-700 shadow-sm shadow-indigo-100" : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"}`}
          >
            {item.icon}
            <span className="md:inline">{item.label}</span>
            {location.pathname === item.path && <ChevronRight className="w-3 h-3 ml-auto hidden md:block text-indigo-400" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: dashboard, isLoading } = trpc.admin.dashboard.useQuery();

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
    { label: "Total Users", value: dashboard?.stats.totalUsers || 0, icon: <Users className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
    { label: "Total Products", value: dashboard?.stats.totalProducts || 0, icon: <Package className="w-5 h-5 text-green-600" />, color: "bg-green-50" },
    { label: "Total Orders", value: dashboard?.stats.totalOrders || 0, icon: <ShoppingCart className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
    { label: "Revenue", value: `${CURRENCY}${(dashboard?.stats.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-yellow-600" />, color: "bg-yellow-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass border-0 shadow-sm hover:shadow-md transition-shadow rounded-[1.5rem]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-inner`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-bold text-gray-800"><TrendingUp className="w-5 h-5 text-indigo-500" /> Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.topProducts?.length ? dashboard.topProducts.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white/50 border border-white rounded-xl shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm font-semibold text-gray-800 truncate flex-1">{p.name}</p>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md ml-3">{p.totalSales} sold</span>
                </div>
              )) : <p className="text-gray-500 text-center py-6 text-sm">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-bold text-gray-800"><AlertTriangle className="w-5 h-5 text-rose-500" /> Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.lowStock?.length ? dashboard.lowStock.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm font-semibold text-gray-800 truncate flex-1">{p.name}</p>
                  <Badge variant="destructive" className="text-xs shadow-sm bg-rose-500">{p.stockQuantity} left</Badge>
                </div>
              )) : <p className="text-gray-500 text-center py-6 text-sm">All stocked</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0 shadow-sm rounded-[1.5rem] overflow-hidden">
        <CardHeader className="bg-white/40 border-b border-gray-100/50">
          <CardTitle className="text-lg font-bold text-gray-800">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Order #</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Payment</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboard?.recentOrders?.length ? dashboard.recentOrders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{order.orderNumber}</td>
                    <td className="py-4 px-6"><Badge variant="secondary" className="bg-white shadow-sm border border-gray-200 text-gray-700">{order.status}</Badge></td>
                    <td className="py-4 px-6 uppercase font-medium text-gray-600">{order.paymentMethod}</td>
                    <td className="py-4 px-6 font-bold text-indigo-700">{CURRENCY}{Number(order.total).toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="text-center py-8 text-gray-500">No orders</td></tr>}
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
