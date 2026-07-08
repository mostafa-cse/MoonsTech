import { Link, Routes, Route, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURRENCY } from "@/const";
import {
  LayoutDashboard, Package, ChevronRight, Truck, CheckCircle2,
  DollarSign, MapPin, Clock, ArrowRight, ShieldCheck, KeyRound
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

function DeliverySidebar() {
  const location = useLocation();
  const menuItems = [
    { path: "/delivery", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: "/delivery/orders", label: "My Deliveries", icon: <Package className="w-4 h-4" /> },
    { path: "/delivery/earnings", label: "Earnings", icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full md:w-64 shrink-0">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-3 md:p-5 md:space-y-1 sticky top-24 flex md:flex-col overflow-x-auto gap-2 md:gap-0 whitespace-nowrap">
        <div className="px-3 py-2 mb-3 hidden md:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Portal</p>
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl text-sm transition-all duration-200 font-medium ${
                isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.icon}
              <span className="md:inline">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto hidden md:block text-indigo-400" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DeliveryDashboard() {
  const { data: dashboard } = useQuery({
    queryKey: ["delivery", "dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/delivery/dashboard");
      return data;
    }
  });

  const stats = [
    { label: "Assigned", value: dashboard?.assigned || 0, icon: <Package className="w-5 h-5 text-indigo-600" />, color: "bg-indigo-50" },
    { label: "In Progress", value: dashboard?.inProgress || 0, icon: <Truck className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
    { label: "Completed", value: dashboard?.completed || 0, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, color: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
          D
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Dashboard</h2>
          <p className="text-slate-500 font-medium">Welcome back! Here's your delivery summary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={stat.label}>
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all rounded-2xl">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-inner`}>{stat.icon}</div>
                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 rounded-2xl shadow-xl shadow-slate-900/20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Truck className="w-32 h-32" /></div>
        <CardContent className="p-8 relative z-10">
          <h3 className="text-xl font-bold mb-2">Ready to hit the road?</h3>
          <p className="text-slate-300 mb-6 max-w-md leading-relaxed">Check your assignments tab to view orders that have been routed to you. Complete deliveries to earn commissions.</p>
          <Link to="/delivery/orders">
            <Button className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 rounded-xl transition-all active:scale-95">
              View Assignments <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function MyDeliveries() {
  const queryClient = useQueryClient();
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["delivery", "assignedOrders"],
    queryFn: async () => {
      const { data } = await apiClient.get("/delivery/assignments");
      return data;
    }
  });
  
  const acceptDelivery = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/delivery/accept", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["delivery", "assignedOrders"] }); toast.success("Delivery accepted"); },
  });
  const pickupDelivery = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/delivery/pickup", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["delivery", "assignedOrders"] }); toast.success("Package picked up"); },
  });
  const completeDelivery = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/delivery/complete", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["delivery", "assignedOrders"] }); toast.success("Delivery completed"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Deliveries</h2>
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
          {assignments?.length || 0} Orders
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : assignments && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment: any, idx: number) => {
            const isHandover = assignment.status === "HandoverToDelivery";
            const isInTransit = assignment.status === "InTransit";
            const isOutForDelivery = assignment.status === "OutForDelivery";

            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={assignment.id}>
                <Card className={`border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden ${isOutForDelivery ? "border-l-4 border-l-purple-500 bg-purple-50/10" : isInTransit ? "border-l-4 border-l-amber-500 bg-amber-50/10" : "border-l-4 border-l-indigo-500 bg-indigo-50/10"}`}>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                      <div className="space-y-3 flex-1 w-full">
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                          <Badge className={`${isHandover ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : isInTransit ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}>
                            {isHandover ? "Assigned" : isInTransit ? "Picked Up" : "Out For Delivery"}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-start gap-3 text-sm bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                          <div className="text-slate-700 font-medium leading-relaxed">
                            {assignment.order?.deliveryAddress ? (() => {
                              let addr = assignment.order.deliveryAddress;
                              if (typeof addr === 'string') {
                                try { addr = JSON.parse(addr); } catch(e) { addr = { thana: "Invalid Data", fullAddress: "" }; }
                              }
                              return (
                                <div>
                                  <p>{addr?.fullAddress}</p>
                                  <p className="text-slate-500 text-xs mt-1">{addr?.thana}, {addr?.district}, {addr?.division}</p>
                                </div>
                              );
                            })() : "No Address Data"}
                          </div>
                        </div>

                        {assignment.otp && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100/80 px-3 py-2 rounded-lg w-max">
                            <KeyRound className="w-4 h-4 text-slate-500" />
                            OTP Verification required on delivery
                          </div>
                        )}
                      </div>

                      <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2 mt-2 sm:mt-0">
                        {isHandover && (
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 rounded-xl transition-all active:scale-95 h-11" onClick={() => acceptDelivery.mutate({ assignmentId: assignment.id })}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Order
                          </Button>
                        )}
                        {isInTransit && (
                          <Button className="w-full bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-200 rounded-xl transition-all active:scale-95 h-11" onClick={() => pickupDelivery.mutate({ assignmentId: assignment.id })}>
                            <Package className="w-4 h-4 mr-2" /> Mark Picked Up
                          </Button>
                        )}
                        {isOutForDelivery && (
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 rounded-xl transition-all active:scale-95 h-11" onClick={() => {
                            const otp = window.prompt("Customer Verification OTP:");
                            if (otp) completeDelivery.mutate({ assignmentId: assignment.id, otp });
                          }}>
                            <ShieldCheck className="w-4 h-4 mr-2" /> Complete Delivery
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50 shadow-none rounded-2xl">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Deliveries</h3>
            <p className="text-slate-500">You don't have any orders assigned to you at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Earnings() {
  const { data: earnings } = useQuery({
    queryKey: ["delivery", "earnings"],
    queryFn: async () => {
      const { data } = await apiClient.get("/delivery/earnings");
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & History</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-600/20 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10"><DollarSign className="w-32 h-32" /></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-emerald-100 mb-1 uppercase tracking-wider">Total Earnings</p>
            <p className="text-4xl font-black tracking-tight">{CURRENCY}{(earnings?.totalEarnings || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Completed Deliveries</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{earnings?.totalDeliveries || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">COD Collected</p>
            <p className="text-4xl font-black text-indigo-600 tracking-tight">{CURRENCY}{(earnings?.totalCOD || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Recent Deliveries</CardTitle>
          <CardDescription>A log of your recently completed delivery runs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {earnings?.history && earnings.history.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {earnings.history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Order #{h.id.substring(0,8).toUpperCase()}</p>
                      <p className="text-sm font-medium text-slate-500">{h.deliveredAt ? new Date(h.deliveredAt).toLocaleString() : "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                      +{CURRENCY}{Number(h.commission || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No delivery history yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Delivery() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <DeliverySidebar />
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<DeliveryDashboard />} />
              <Route path="/orders" element={<MyDeliveries />} />
              <Route path="/earnings" element={<Earnings />} />
            </Routes>
          </div>
        </div>
      </div>
    </Layout>
  );
}
