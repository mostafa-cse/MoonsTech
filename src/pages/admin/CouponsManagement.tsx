import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY } from "@/const";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CouponsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { data: couponsList, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data } = await apiClient.get("/coupon/all").catch(() => ({ data: [] }));
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/coupon", data),
    onSuccess: () => {
      toast.success("Coupon created successfully");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create coupon"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.put(`/coupon/${data.id}`, data),
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update coupon"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.delete(`/coupon/${data.id}`),
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete coupon"),
  });

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: "",
    maximumDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: "true"
  });

  const handleOpenNew = () => {
    setEditingCoupon(null);
    setFormData({
      code: "", description: "", discountType: "percentage", discountValue: "",
      minimumOrderAmount: "", maximumDiscount: "",
      startDate: new Date().toISOString().slice(0,16),
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,16),
      usageLimit: "", isActive: "true"
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: c.discountValue.toString(),
      minimumOrderAmount: c.minimumOrderAmount ? c.minimumOrderAmount.toString() : "",
      maximumDiscount: c.maximumDiscount ? c.maximumDiscount.toString() : "",
      startDate: new Date(c.startDate).toISOString().slice(0,16),
      endDate: new Date(c.endDate).toISOString().slice(0,16),
      usageLimit: c.usageLimit ? c.usageLimit.toString() : "",
      isActive: c.isActive ? "true" : "false"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      discountValue: formData.discountType === 'free_shipping' ? "0" : formData.discountValue,
      minimumOrderAmount: formData.minimumOrderAmount ? formData.minimumOrderAmount : undefined,
      maximumDiscount: formData.maximumDiscount ? formData.maximumDiscount : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      isActive: formData.isActive === "true",
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, ...payload } as any);
    } else {
      createMutation.mutate(payload as any);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Coupons</h2>
          <p className="text-sm text-slate-500 mt-1">Create and manage discount codes for your customers.</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200">
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Code</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Discount</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Valid Until</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Usage</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="text-right py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-medium">Loading coupons...</td></tr>
                ) : couponsList?.length ? (
                  couponsList.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md tracking-wider border border-slate-200/60">{c.code}</span>
                      </td>
                      <td className="py-4 px-6 font-medium text-indigo-700">
                        {c.discountType === 'percentage' ? `${c.discountValue}% Off` : 
                         c.discountType === 'free_shipping' ? 'Free Shipping' : 
                         `${CURRENCY}${c.discountValue} Off`}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600 font-medium">
                          <span className="text-slate-900">{c.usageCount || 0}</span> / {c.usageLimit || '∞'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className={`font-medium rounded-md border-0 px-2.5 py-0.5 ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" aria-label="Edit Coupon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => handleOpenEdit(c)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Delete Coupon" className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">No coupons found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-6 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">{editingCoupon ? "Edit Coupon" : "New Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Code</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER10" required />
              </div>
              
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={formData.discountType} onValueChange={(v) => setFormData({...formData, discountType: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input type="number" step="0.01" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required disabled={formData.discountType === 'free_shipping'} />
              </div>

              <div className="space-y-2">
                <Label>Minimum Order</Label>
                <Input type="number" step="0.01" value={formData.minimumOrderAmount} onChange={e => setFormData({...formData, minimumOrderAmount: e.target.value})} placeholder="Optional" />
              </div>

              <div className="space-y-2">
                <Label>Maximum Discount</Label>
                <Input type="number" step="0.01" value={formData.maximumDiscount} onChange={e => setFormData({...formData, maximumDiscount: e.target.value})} placeholder="Optional (for %)" />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} placeholder="Optional" />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.isActive} onValueChange={(v) => setFormData({...formData, isActive: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t mt-4 border-slate-100">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
