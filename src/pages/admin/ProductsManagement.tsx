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

export default function ProductsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { data: productsList, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get("/product/products?limit=50").catch(() => ({ data: { items: [] } }));
      return data;
    }
  });
  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => []
  });
  const { data: brands } = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: async () => []
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/product", data),
    onSuccess: () => {
      toast.success("Product created successfully");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create product"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.put(`/product/${data.id}`, data),
    onSuccess: () => {
      toast.success("Product updated successfully");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.delete(`/product/${data.id}`),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete product"),
  });

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    slug: "",
    regularPrice: "",
    salePrice: "",
    stockQuantity: 0,
    categoryId: "",
    brandId: "",
    status: "draft"
  });

  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "", sku: "", slug: "", regularPrice: "", salePrice: "", stockQuantity: 0, categoryId: "", brandId: "", status: "draft"
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku || "",
      slug: p.slug,
      regularPrice: p.regularPrice.toString(),
      salePrice: p.discountPrice ? p.discountPrice.toString() : "",
      stockQuantity: p.stockQuantity || 0,
      categoryId: p.categoryId ? p.categoryId.toString() : "",
      brandId: p.brandId ? p.brandId.toString() : "",
      status: p.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      regularPrice: formData.regularPrice,
      discountPrice: formData.salePrice ? formData.salePrice : undefined,
      stockQuantity: Number(formData.stockQuantity),
      categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
      brandId: formData.brandId ? Number(formData.brandId) : undefined,
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...payload } as any);
    } else {
      createMutation.mutate(payload as any);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your store's inventory and product details.</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Name</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Price</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Stock</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="text-right py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium">Loading products...</td></tr>
                ) : productsList?.items?.length ? (
                  productsList.items.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-4 px-6 font-medium text-slate-700">{CURRENCY}{Number(p.discountPrice || p.regularPrice).toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(p.stockStatus || (p.stockQuantity > 0 ? 'in_stock' : 'out_of_stock')) === 'in_stock' ? 'bg-emerald-50 text-emerald-700' : (p.stockStatus || (p.stockQuantity > 0 ? 'in_stock' : 'out_of_stock')) === 'pre_order' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                          {(p.stockStatus || (p.stockQuantity > 0 ? 'in_stock' : 'out_of_stock')) === 'in_stock' ? `${p.stockQuantity} in stock` : (p.stockStatus || (p.stockQuantity > 0 ? 'in_stock' : 'out_of_stock')).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className={`capitalize font-medium rounded-md border-0 px-2.5 py-0.5 ${p.status === 'published' ? 'bg-emerald-50 text-emerald-700' : p.status === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" aria-label="Edit Product" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => handleOpenEdit(p)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Delete Product" className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-6 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} required />
              </div>
              <div className="space-y-2">
                <Label>Regular Price</Label>
                <Input type="number" step="0.01" value={formData.regularPrice} onChange={e => setFormData({...formData, regularPrice: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Sale Price</Label>
                <Input type="number" step="0.01" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={formData.brandId} onValueChange={(v) => setFormData({...formData, brandId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((b: any) => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t mt-4 border-slate-100">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
