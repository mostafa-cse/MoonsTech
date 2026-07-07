import { useState } from "react";
import { trpc } from "@/providers/trpc";
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
  
  const utils = trpc.useUtils();
  const { data: couponsList, isLoading } = trpc.coupon.listAll.useQuery();

  const createMutation = trpc.coupon.create.useMutation({
    onSuccess: () => {
      toast.success("Coupon created successfully");
      setIsDialogOpen(false);
      utils.coupon.listAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.coupon.update.useMutation({
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      setIsDialogOpen(false);
      utils.coupon.listAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.coupon.delete.useMutation({
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      utils.coupon.listAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Coupons</h2>
        <Button onClick={handleOpenNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Discount</th>
                  <th className="text-left py-3 px-4">Valid Until</th>
                  <th className="text-left py-3 px-4">Usage</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : couponsList?.length ? (
                  couponsList.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-bold">{c.code}</td>
                      <td className="py-2 px-4">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : 
                         c.discountType === 'free_shipping' ? 'Free Shipping' : 
                         `${CURRENCY}${c.discountValue}`}
                      </td>
                      <td className="py-2 px-4 text-gray-500">
                        {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">
                        {c.usageCount || 0} / {c.usageLimit || '∞'}
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant={c.isActive ? 'default' : 'secondary'}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(c)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No coupons found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "New Coupon"}</DialogTitle>
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
