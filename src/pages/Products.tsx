import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY } from "@/const";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Search, Star, ShoppingCart, Heart, SlidersHorizontal, Grid3X3, LayoutList, X, ChevronRight, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryId = searchParams.get("category") || undefined;
  const brandId = searchParams.get("brand") || undefined;
  const searchQuery = searchParams.get("search") || "";
  const featured = searchParams.get("featured") === "true" || undefined;
  const bestSeller = searchParams.get("bestSeller") === "true" || undefined;
  const newArrival = searchParams.get("newArrival") === "true" || undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 500000;
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const sortBy = searchParams.get("sortBy") || "newest";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/cart/add", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cart"] }); toast.success("Added to cart"); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to add to cart"),
  });
  const addToWishlist = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/wishlist", data),
    onSuccess: () => toast.success("Added to wishlist!"),
    onError: (e: any) => toast.error("Failed to add to wishlist"),
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryId, brandId, searchQuery, sortBy, priceRange[0], priceRange[1], featured, bestSeller, newArrival]);

  const { data, isLoading } = useQuery({
    queryKey: ["products", { page, categoryId, brandId, searchQuery, sortBy, minPrice: priceRange[0], maxPrice: priceRange[1], featured, bestSeller, newArrival }],
    queryFn: async () => {
      const res = await apiClient.get("/product", {
        params: { page, limit: 24, categoryId, brandId, searchTerm: searchQuery, sortBy, minPrice: priceRange[0], maxPrice: priceRange[1] }
      });
      return res.data;
    }
  });

  // Debounce price updates to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (priceRange[0] > 0) next.set("minPrice", String(priceRange[0]));
        else next.delete("minPrice");
        
        if (priceRange[1] < 500000) next.set("maxPrice", String(priceRange[1]));
        else next.delete("maxPrice");
        return next;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange, setSearchParams]);

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await apiClient.get("/brand");
      return res.data;
    }
  });
  const { data: categoryTree } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/category");
      return res.data;
    }
  });

  // Find current category name
  const findCategory = (id: string, cats: any[]): any => {
    for (const cat of cats || []) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategory(id, cat.children);
        if (found) return found;
      }
    }
    return null;
  };

  const currentCategory = categoryId && categoryTree ? findCategory(categoryId, categoryTree) : null;

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 500000]);
  };

  const activeFiltersCount = [
    categoryId,
    brandId,
    searchQuery,
    priceRange[0] > 0 || priceRange[1] < 500000,
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Products</span>
          {currentCategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-indigo-600 font-medium">{currentCategory.name}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentCategory ? currentCategory.name : searchQuery ? `Search: "${searchQuery}"` : "All Products"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{data?.pagination.total || 0} products found</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.querySelector("input") as HTMLInputElement;
                if (input.value.trim()) {
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.set("search", input.value.trim());
                    return next;
                  });
                } else {
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.delete("search");
                    return next;
                  });
                }
              }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10 w-48 lg:w-64"
                defaultValue={searchQuery}
              />
            </form>

            <Button variant="outline" size="icon" aria-label="Toggle View Mode" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? <LayoutList className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {filtersOpen || (typeof window !== "undefined" && window.innerWidth >= 1024) ? (
              <motion.aside 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-64 shrink-0 overflow-hidden ${filtersOpen ? "block" : "hidden lg:block"}`}
              >
                <div className="bg-white rounded-xl border p-4 space-y-6 sticky top-24">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Filters
                    </h3>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 h-auto p-0">
                        <X className="w-3 h-3 mr-1" /> Clear
                      </Button>
                    )}
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Categories</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {(categoryTree || []).map((cat: any) => (
                        <button
                          key={cat.id}
                          onClick={() => setSearchParams(prev => {
                            const next = new URLSearchParams(prev);
                            next.set("category", String(cat.id));
                            return next;
                          })}
                          className={`block w-full text-left text-sm px-2 py-1 rounded ${categoryId === cat.id ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Price Range</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500000}
                      step={1000}
                      className="my-4"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{CURRENCY}{priceRange[0].toLocaleString()}</span>
                      <span>{CURRENCY}{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Brands</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {(brands || []).map((brand: any) => (
                        <button
                          key={brand.id}
                          onClick={() => setSearchParams(prev => {
                            const next = new URLSearchParams(prev);
                            next.set("brand", String(brand.id));
                            return next;
                          })}
                          className={`block w-full text-left text-sm px-2 py-1 rounded ${brandId === brand.id ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(!filtersOpen)}>
                <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.set("sortBy", e.target.value);
                    return next;
                  })}
                  className="text-sm border rounded-lg px-3 py-1.5 bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Popular</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"}>
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className={viewMode === "grid" ? "h-72" : "h-32"} />)}
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(data?.items || []).map((product: any) => (
                      <Card key={product.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col h-full">
                        <Link to={`/product/${product.slug}`}>
                          <div className="relative aspect-square bg-gray-50 overflow-hidden">
                            {product.imageUrl ? (
                              <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                                <PackageOpen className="w-10 h-10" />
                              </div>
                            )}
                            {product.discountPrice && (
                              <Badge className="absolute top-3 left-3 bg-rose-500 hover:bg-rose-600 shadow-sm">-{Math.round((1 - product.discountPrice / product.regularPrice) * 100)}%</Badge>
                            )}
                            {product.isNewArrival && (
                              <Badge className="absolute top-3 right-3 bg-emerald-500 hover:bg-emerald-600 shadow-sm">New</Badge>
                            )}
                          </div>
                        </Link>
                        <CardContent className="p-4 flex flex-col flex-1">
                          <Link to={`/product/${product.slug}`}>
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.5rem] leading-tight">{product.name}</h3>
                          </Link>
                          <div className="flex items-center gap-1 mt-1 mb-2">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">{product.avgRating || '0.0'} ({product.reviewCount || 0})</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.shortDescription || "No description available."}</p>
                          <div className="mt-auto pt-2">
                            <div className="flex items-end gap-2 mb-3">
                              <span className="text-lg font-bold text-indigo-600 leading-none">{CURRENCY}{Number(product.discountPrice || product.regularPrice).toLocaleString()}</span>
                              {product.discountPrice && Number(product.discountPrice) !== Number(product.regularPrice) && (
                                <span className="text-xs text-gray-400 line-through leading-none pb-0.5">{CURRENCY}{Number(product.regularPrice).toLocaleString()}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 shadow-sm shadow-indigo-200"
                                disabled={addToCart.isPending || product.stockQuantity <= 0}
                                onClick={() => {
                                  if (!isAuthenticated) { toast.error('Please log in to add items to cart'); return; }
                                  addToCart.mutate({ 
                                    productId: product.id, 
                                    quantity: 1,
                                    name: product.name,
                                    slug: product.slug,
                                    image: product.imageUrl,
                                    sku: product.sku,
                                    unitPrice: product.discountPrice || product.regularPrice
                                  });
                                }}
                              ><ShoppingCart className="w-4 h-4 mr-1.5" /> Add</Button>
                              <Button 
                                size="sm" variant="outline" className="h-9 w-9 p-0 border-gray-200 text-gray-600 hover:text-rose-500 hover:bg-rose-50"
                                disabled={addToWishlist.isPending}
                                onClick={() => {
                                  if (!isAuthenticated) { toast.error('Please log in first'); return; }
                                  addToWishlist.mutate({ productId: product.id });
                                }}
                              ><Heart className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(data?.items || []).length === 0 && (
                      <div className="col-span-2 md:col-span-3 xl:col-span-4 py-20 flex flex-col items-center justify-center text-gray-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <PackageOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search query.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(data?.items || []).map((product: any) => (
                      <Card key={product.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl">
                        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                          <Link to={`/product/${product.slug}`} className="w-full sm:w-32 h-40 sm:h-32 shrink-0 bg-gray-50 rounded-xl overflow-hidden relative block">
                            {product.imageUrl ? (
                              <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                                <PackageOpen className="w-8 h-8" />
                              </div>
                            )}
                            {product.discountPrice && (
                              <Badge className="absolute top-2 left-2 bg-rose-500 shadow-sm">-{Math.round((1 - product.discountPrice / product.regularPrice) * 100)}%</Badge>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${product.slug}`}>
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{product.name}</h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-gray-700">{product.avgRating || '0.0'}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{product.reviewCount || 0} reviews</span>
                              <span className="text-gray-300">•</span>
                              <span className={`text-sm font-medium ${product.stockQuantity > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                                {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.shortDescription || "No description available."}</p>
                          </div>
                          <div className="flex flex-col items-start sm:items-end shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                            <p className="text-2xl font-extrabold text-indigo-600">{CURRENCY}{Number(product.discountPrice || product.regularPrice).toLocaleString()}</p>
                            {product.discountPrice && Number(product.discountPrice) !== Number(product.regularPrice) && (
                              <p className="text-sm text-gray-400 line-through mt-0.5">{CURRENCY}{Number(product.regularPrice).toLocaleString()}</p>
                            )}
                            <div className="flex gap-2 mt-4 w-full">
                              <Button 
                                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 px-6 shadow-sm shadow-indigo-200"
                                disabled={addToCart.isPending || product.stockQuantity <= 0}
                                onClick={() => {
                                  if (!isAuthenticated) { toast.error('Please log in to add items to cart'); return; }
                                  addToCart.mutate({ 
                                    productId: product.id, 
                                    quantity: 1,
                                    name: product.name,
                                    slug: product.slug,
                                    image: product.imageUrl,
                                    sku: product.sku,
                                    unitPrice: product.discountPrice || product.regularPrice
                                  });
                                }}
                              ><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart</Button>
                              <Button 
                                variant="outline" className="h-10 w-10 p-0 border-gray-200 text-gray-600 hover:text-rose-500 hover:bg-rose-50"
                                disabled={addToWishlist.isPending}
                                onClick={() => {
                                  if (!isAuthenticated) { toast.error('Please log in first'); return; }
                                  addToWishlist.mutate({ productId: product.id });
                                }}
                              ><Heart className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(data?.items || []).length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <PackageOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search query.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: data.pagination.totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? "default" : "outline"}
                        size="sm"
                        className={page === i + 1 ? "bg-indigo-600" : ""}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
