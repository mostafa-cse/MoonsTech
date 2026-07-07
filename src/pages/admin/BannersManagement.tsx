import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BannersManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: bannersList, isLoading } = trpc.admin.banners.useQuery();

  const createMutation = trpc.admin.createBanner.useMutation({
    onSuccess: () => {
      toast.success("Banner created successfully");
      setIsDialogOpen(false);
      utils.admin.banners.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.updateBanner.useMutation({
    onSuccess: () => {
      toast.success("Banner updated successfully");
      setIsDialogOpen(false);
      utils.admin.banners.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.deleteBanner.useMutation({
    onSuccess: () => {
      toast.success("Banner deleted successfully");
      utils.admin.banners.invalidate();
    },
    onError: (err) => toast.error(err.message),
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Banners</h2>
        <Button onClick={handleOpenNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Image</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : bannersList?.length ? (
                  bannersList.map((b: any) => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <img src={b.image} alt={b.title} className="h-10 w-20 object-cover rounded" />
                      </td>
                      <td className="py-2 px-4 font-bold">{b.title}</td>
                      <td className="py-2 px-4 uppercase text-xs text-gray-500">{b.position?.replace('_', ' ') || ''}</td>
                      <td className="py-2 px-4">{b.sortOrder}</td>
                      <td className="py-2 px-4">
                        <Badge variant={b.isActive ? 'default' : 'secondary'}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(b)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(b.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No banners found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "New Banner"}</DialogTitle>
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
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingBanner ? "Save Changes" : "Create Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
