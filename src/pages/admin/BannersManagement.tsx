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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export default function BannersManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { data: bannersList, isLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/banners").catch(() => ({ data: [] }));
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/admin/banners", data),
    onSuccess: () => {
      toast.success("Banner created successfully");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create banner"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.put(`/admin/banners/${data.id}`, data),
    onSuccess: () => {
      toast.success("Banner updated successfully");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update banner"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.delete(`/admin/banners/${data.id}`),
    onSuccess: () => {
      toast.success("Banner deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete banner"),
  });

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    position: "home_hero",
    sortOrder: "0",
    isActive: "true"
  });

  const handleOpenNew = () => {
    setEditingBanner(null);
    setFormData({
      title: "", subtitle: "", image: "", link: "",
      position: "home_hero", sortOrder: "0", isActive: "true"
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || "",
      image: b.image,
      link: b.link || "",
      position: b.position,
      sortOrder: b.sortOrder ? b.sortOrder.toString() : "0",
      isActive: b.isActive ? "true" : "false"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sortOrder: Number(formData.sortOrder),
      isActive: formData.isActive === "true",
    };

    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, ...payload } as any);
    } else {
      createMutation.mutate(payload as any);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Banners</h2>
          <p className="text-sm text-slate-500 mt-1">Manage promotional banners across the store.</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Image</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Title</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Position</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Order</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="text-right py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-medium">Loading banners...</td></tr>
                ) : bannersList?.length ? (
                  bannersList.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="h-12 w-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shadow-sm">
                          <ImageWithFallback src={b.image} alt={b.title} className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{b.title}</td>
                      <td className="py-4 px-6 uppercase text-[11px] font-bold text-slate-500 tracking-wider">
                        {b.position?.replace('_', ' ') || ''}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">{b.sortOrder}</td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className={`font-medium rounded-md border-0 px-2.5 py-0.5 ${b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" aria-label="Edit Banner" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => handleOpenEdit(b)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Delete Banner" className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg" onClick={() => handleDelete(b.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">No banners found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-6 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">{editingBanner ? "Edit Banner" : "New Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." required />
              </div>

              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="/category/some-slug" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={formData.position} onValueChange={(v) => setFormData({...formData, position: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home_hero">Home Hero</SelectItem>
                      <SelectItem value="home_promo">Home Promo</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} />
                </div>
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
                {editingBanner ? "Save Changes" : "Create Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
