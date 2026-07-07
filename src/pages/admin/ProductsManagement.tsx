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

export default function ProductsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: productsList, isLoading } = trpc.product.list.useQuery({ limit: 50 });
  const { data: categories } = trpc.category.list.useQuery();
  const { data: brands } = trpc.brand.list.useQuery();

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      setIsDialogOpen(false);
      utils.product.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      setIsDialogOpen(false);
      utils.product.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      utils.product.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
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
      salePrice: p.salePrice ? p.salePrice.toString() : "",
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
      salePrice: formData.salePrice ? formData.salePrice : undefined,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products</h2>
        <Button onClick={handleOpenNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                ) : productsList?.items?.length ? (
                  productsList.items.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{p.name}</td>
                      <td className="py-2 px-4">{CURRENCY}{Number(p.salePrice || p.regularPrice).toLocaleString()}</td>
                      <td className="py-2 px-4">{p.stockStatus}</td>
                      <td className="py-2 px-4"><Badge variant={p.status === 'published' ? 'default' : 'secondary'}>{p.status}</Badge></td>
                      <td className="py-2 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
