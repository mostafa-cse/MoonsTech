import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURRENCY } from "@/const";
import { Download, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

export default function SalesAnalytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["admin", "salesReport", dateRange],
    queryFn: async () => {
      const { data } = await apiClient.post("/admin/sales-report", dateRange).catch(() => ({ data: { orders: [], dailyRevenue: [] } }));
      return data;
    }
  });

  const handleExportCSV = () => {
    if (!report?.orders || report.orders.length === 0) return;

    // Build CSV Content
    const headers = ["Order #", "Date", "Status", "Payment Method", "Payment Status", "Subtotal", "Discount", "Shipping", "Total"];
    
    const rows = report.orders.map((order: any) => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString(),
      order.status,
      order.paymentMethod,
      order.paymentStatus,
      order.subtotal,
      order.discountAmount,
      order.shippingCost,
      order.total
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(","))
    ].join("\n");

    // Create Blob and Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = report?.orders?.reduce((sum: number, o: any) => sum + Number(o.total), 0) || 0;
  const totalOrders = report?.orders?.length || 0;
  const totalDiscounts = report?.orders?.reduce((sum: number, o: any) => sum + Number(o.discountAmount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sales Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Analyze your store's sales performance and export reports.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="start" className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</Label>
              <Input 
                id="start" 
                type="date" 
                value={dateRange.startDate} 
                onChange={(e) => setDateRange(p => ({ ...p, startDate: e.target.value }))}
                className="h-9 w-[130px] border-slate-200 bg-slate-50 rounded-lg text-sm font-medium"
              />
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <Label htmlFor="end" className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</Label>
              <Input 
                id="end" 
                type="date" 
                value={dateRange.endDate} 
                onChange={(e) => setDateRange(p => ({ ...p, endDate: e.target.value }))}
                className="h-9 w-[130px] border-slate-200 bg-slate-50 rounded-lg text-sm font-medium"
              />
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <Button onClick={handleExportCSV} disabled={!report?.orders?.length} className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-200 px-4">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-5 relative h-full">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{CURRENCY}{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Revenue</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-5 relative h-full">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{totalOrders.toLocaleString()}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Orders</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-5 relative h-full">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{CURRENCY}{totalDiscounts.toLocaleString()}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Discounts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80 w-full flex items-end justify-between gap-2 px-2 pb-8 pt-4 relative">
                {report?.dailyRevenue && report.dailyRevenue.length > 0 ? (
                  <>
                    <div className="absolute left-0 top-0 h-full w-full pointer-events-none flex flex-col justify-between pb-8 z-0">
                      {[4, 3, 2, 1, 0].map(i => (
                        <div key={i} className="w-full border-b border-slate-100 flex-1 relative">
                        </div>
                      ))}
                    </div>
                    {report.dailyRevenue.map((day: any, i: number) => {
                      const maxRev = Math.max(...report.dailyRevenue.map((d: any) => Number(d.revenue)));
                      const heightPercent = maxRev > 0 ? (Number(day.revenue) / maxRev) * 100 : 0;
                      return (
                        <div key={i} className="relative flex flex-col items-center flex-1 z-10 group h-full justify-end">
                          <div 
                            className="w-full max-w-[40px] bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all duration-300 relative shadow-sm"
                            style={{ height: `${Math.max(heightPercent, 2)}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                              {CURRENCY}{Number(day.revenue).toLocaleString()}
                            </div>
                          </div>
                          <span className="absolute -bottom-6 text-[10px] font-bold text-slate-400 whitespace-nowrap truncate w-full text-center">
                            {new Date(day.date).getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium">
                    No sales data available for this period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Sales Data</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 sticky top-0 backdrop-blur-md border-b border-slate-100 shadow-sm">
                    <tr>
                      <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Order #</th>
                      <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Date</th>
                      <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                      <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Payment</th>
                      <th className="text-right py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report?.orders?.length ? report.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6 font-semibold text-slate-900">{order.orderNumber}</td>
                        <td className="py-4 px-6 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 capitalize font-medium rounded-md">{order.status}</Badge>
                        </td>
                        <td className="py-4 px-6 uppercase text-[11px] font-bold text-slate-500 tracking-wider">{order.paymentMethod}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900">
                          {CURRENCY}{Number(order.total).toLocaleString()}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">No orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
