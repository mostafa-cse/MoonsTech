import { useState } from "react";
import { trpc } from "@/providers/trpc";
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

  const { data: report, isLoading } = trpc.admin.salesReport.useQuery(dateRange);

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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sales Analytics</h2>
          <p className="text-sm text-gray-500">Analyze your store's sales performance and export reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="grid gap-1">
              <Label htmlFor="start" className="text-xs">Start Date</Label>
              <Input 
                id="start" 
                type="date" 
                value={dateRange.startDate} 
                onChange={(e) => setDateRange(p => ({ ...p, startDate: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="end" className="text-xs">End Date</Label>
              <Input 
                id="end" 
                type="date" 
                value={dateRange.endDate} 
                onChange={(e) => setDateRange(p => ({ ...p, endDate: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>
          <Button onClick={handleExportCSV} disabled={!report?.orders?.length} className="h-9 mt-5 gap-2 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4" /> Export Excel (CSV)
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 glass animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{CURRENCY}{totalRevenue.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-sm rounded-[1.5rem]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Discounts</p>
                  <p className="text-2xl font-bold text-gray-900">{CURRENCY}{totalDiscounts.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-0 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="bg-white/40 border-b border-gray-100/50">
              <CardTitle className="text-lg font-bold text-gray-800">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80 w-full flex items-end justify-between gap-2 px-2 pb-8 pt-4 relative">
                {report?.dailyRevenue && report.dailyRevenue.length > 0 ? (
                  <>
                    <div className="absolute left-0 top-0 h-full w-full pointer-events-none flex flex-col justify-between pb-8 z-0">
                      {[4, 3, 2, 1, 0].map(i => (
                        <div key={i} className="w-full border-b border-gray-100/50 flex-1 relative">
                          <span className="absolute -left-2 -top-2 text-[10px] text-gray-400 font-medium">
                            {i === 4 ? '' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                    {report.dailyRevenue.map((day: any, i: number) => {
                      const maxRev = Math.max(...report.dailyRevenue.map((d: any) => Number(d.revenue)));
                      const heightPercent = maxRev > 0 ? (Number(day.revenue) / maxRev) * 100 : 0;
                      return (
                        <div key={i} className="relative flex flex-col items-center flex-1 z-10 group h-full justify-end">
                          <div 
                            className="w-full max-w-[40px] bg-indigo-500/80 hover:bg-indigo-600 rounded-t-md transition-all duration-300 relative"
                            style={{ height: `${Math.max(heightPercent, 2)}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {CURRENCY}{Number(day.revenue).toLocaleString()}
                            </div>
                          </div>
                          <span className="absolute -bottom-6 text-[10px] text-gray-400 whitespace-nowrap truncate w-full text-center">
                            {new Date(day.date).getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    No sales data available for this period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="bg-white/40 border-b border-gray-100/50">
              <CardTitle className="text-lg font-bold text-gray-800">Sales Data</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Order #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Payment</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report?.orders?.length ? report.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="bg-white border-gray-200">{order.status}</Badge>
                        </td>
                        <td className="py-3 px-4 uppercase text-xs text-gray-600">{order.paymentMethod}</td>
                        <td className="py-3 px-4 text-right font-bold text-indigo-700">
                          {CURRENCY}{Number(order.total).toLocaleString()}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-500">No orders found</td></tr>
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
