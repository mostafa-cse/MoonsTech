import { Link, Routes, Route, useLocation } from "react-router";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURRENCY } from "@/const";
import {
  LayoutDashboard, Package, ChevronRight, Truck, CheckCircle2,
  DollarSign, MapPin
} from "lucide-react";
import { toast } from "sonner";

function DeliverySidebar() {
  const location = useLocation();
  const menuItems = [
    { path: "/delivery", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: "/delivery/orders", label: "My Deliveries", icon: <Package className="w-4 h-4" /> },
    { path: "/delivery/earnings", label: "Earnings", icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full md:w-64 shrink-0">
      <div className="glass rounded-[1.5rem] p-3 md:p-5 md:space-y-1 sticky top-24 flex md:flex-col overflow-x-auto gap-2 md:gap-0 whitespace-nowrap">
        <div className="px-3 py-2 mb-3 hidden md:block">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Portal</p>
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

function DeliveryDashboard() {
  const { data: dashboard } = trpc.delivery.dashboard.useQuery();

  const stats = [
    { label: "Assigned", value: dashboard?.assigned || 0, icon: <Package className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
    { label: "In Progress", value: dashboard?.inProgress || 0, icon: <Truck className="w-5 h-5 text-yellow-600" />, color: "bg-yellow-50" },
    { label: "Completed", value: dashboard?.completed || 0, icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, color: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          D
        </div>
        <div>
          <h2 className="text-xl font-bold">Delivery Dashboard</h2>
          <p className="text-gray-500">Welcome back! Here's your delivery summary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  );
}

function MyDeliveries() {
  const { data: assignments, isLoading } = trpc.delivery.assignedOrders.useQuery();
  const utils = trpc.useUtils();
  const acceptDelivery = trpc.delivery.accept.useMutation({
    onSuccess: () => { utils.delivery.assignedOrders.invalidate(); toast.success("Delivery accepted"); },
  });
  const pickupDelivery = trpc.delivery.pickup.useMutation({
    onSuccess: () => { utils.delivery.assignedOrders.invalidate(); toast.success("Package picked up"); },
  });
  const completeDelivery = trpc.delivery.complete.useMutation({
    onSuccess: () => { utils.delivery.assignedOrders.invalidate(); toast.success("Delivery completed"); },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Deliveries</h2>
      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-36 glass rounded-[1.5rem] animate-pulse" />)}</div>
      ) : assignments && assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((assignment: any) => (
            <Card key={assignment.id} className="glass border-0 shadow-sm rounded-2xl hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge>{assignment.status}</Badge>
                    <span className="text-sm text-gray-500">OTP: {assignment.otp || "N/A"}</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(assignment.assignedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {assignment.order?.deliveryAddress ? (() => {
                      let addr = assignment.order.deliveryAddress;
                      if (typeof addr === 'string') {
                        try { addr = JSON.parse(addr); } catch(e) { addr = { thana: "Invalid Data" }; }
                      }
                      return addr?.thana || "N/A";
                    })() : "N/A"}
                  </span>
                </div>

                <div className="flex gap-2">
                  {assignment.status === "assigned" && (
                    <Button size="sm" className="bg-green-600" onClick={() => acceptDelivery.mutate({ assignmentId: assignment.id })}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                    </Button>
                  )}
                  {assignment.status === "accepted" && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => pickupDelivery.mutate({ assignmentId: assignment.id })}>
                      <Package className="w-4 h-4 mr-1" /> Pickup
                    </Button>
                  )}
                  {assignment.status === "picked_up" && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                      const otp = window.prompt("Enter OTP provided by customer:");
                      if (otp) completeDelivery.mutate({ assignmentId: assignment.id, otp });
                    }}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No deliveries assigned yet</p>
      )}
    </div>
  );
}

function Earnings() {
  const { data: earnings } = trpc.delivery.earnings.useQuery();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Earnings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
          <CardContent className="p-5">
            <p className="text-3xl font-black text-green-600 tracking-tight">{CURRENCY}{(earnings?.totalEarnings || 0).toLocaleString()}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Total Earnings</p>
          </CardContent>
        </Card>
        <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
          <CardContent className="p-5">
            <p className="text-3xl font-black text-gray-900 tracking-tight">{earnings?.totalDeliveries || 0}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Deliveries</p>
          </CardContent>
        </Card>
        <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
          <CardContent className="p-5">
            <p className="text-3xl font-black text-indigo-600 tracking-tight">{CURRENCY}{(earnings?.totalCOD || 0).toLocaleString()}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">COD Collected</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-gray-800">Delivery History</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings?.history && earnings.history.length > 0 ? (
            <div className="space-y-3">
              {earnings.history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-4 bg-white/50 border border-white rounded-xl shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">Delivery #{h.id}</p>
                    <p className="text-sm text-gray-500">{h.deliveredAt ? new Date(h.deliveredAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">+{CURRENCY}{Number(h.commission || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No delivery history yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Delivery() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6">
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
