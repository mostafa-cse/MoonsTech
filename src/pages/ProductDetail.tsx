import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY } from "@/const";
import { Star, ShoppingCart, Heart, Share2, Truck, ShieldCheck, RotateCcw, ChevronRight, Check, Plus, Minus, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const submitReview = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setIsReviewOpen(false);
      utils.product.getBySlug.invalidate({ slug: slug! });
      setReviewComment("");
      setReviewRating(5);
    },
    onError: (e) => toast.error(e.message),
  });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); toast.success("Added to cart"); },
    onError: (e) => toast.error(e.message),
  });
  const addToWishlist = trpc.wishlist.add.useMutation({
    onSuccess: () => toast.success("Added to wishlist!"),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-500 mt-2">The product you are looking for does not exist.</p>
          <Link to="/products">
            <Button className="mt-4 bg-indigo-600">Browse Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = product.discount || 0;
  const specsByGroup: Record<string, any[]> = {};
  for (const spec of (product.specifications || []) as any[]) {
    if (spec.specGroup && !specsByGroup[spec.specGroup]) specsByGroup[spec.specGroup] = [];
    specsByGroup[spec.specGroup].push(spec);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-indigo-600">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center p-8 relative group">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.imageUrl || product.images[0]?.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <PackageOpen className="w-16 h-16 mb-2" />
                  <span>No Image Available</span>
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-6 left-6 bg-rose-500 shadow-sm border-0 text-sm px-3 py-1">Save {discount}%</Badge>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${selectedImage === i ? "border-indigo-600 shadow-md ring-4 ring-indigo-50" : "border-gray-100 hover:border-gray-300 bg-white"}`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-700">{product.avgRating}</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => document.getElementById('reviews-tab')?.click()}>
                    {product.reviewCount} reviews
                  </span>
                  {product.brandName && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm font-medium text-gray-600">Brand: <span className="text-indigo-600">{product.brandName}</span></span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  disabled={addToWishlist.isPending}
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please log in first'); return; }
                    addToWishlist.mutate({ productId: product.id });
                  }}
                ><Heart className="w-4 h-4" /></Button>
                <Button 
                  variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                ><Share2 className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50 rounded-2xl shadow-sm">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-indigo-600 tracking-tight leading-none">{CURRENCY}{Number(product.salePrice || product.regularPrice).toLocaleString()}</span>
                {product.salePrice && Number(product.salePrice) !== Number(product.regularPrice) && (
                  <span className="text-xl text-gray-400 line-through decoration-gray-300 font-medium mb-1">{CURRENCY}{Number(product.regularPrice).toLocaleString()}</span>
                )}
              </div>
              {product.megaCoinReward && product.megaCoinReward > 0 && (
                <div className="inline-flex items-center gap-1.5 mt-4 bg-indigo-100/50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <span className="text-lg">💎</span> Earn {product.megaCoinReward} MegaCoins
                </div>
              )}
            </div>

            {/* Stock & Warranty */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${product.stockStatus === "in_stock" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                <Check className={`w-4 h-4`} />
                <span>
                  {product.stockStatus === "in_stock" ? "In Stock Ready to Ship" : product.stockStatus === "pre_order" ? "Pre-order Available" : "Out of Stock"}
                </span>
              </div>
              {product.warrantyDuration && product.warrantyDuration > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" /> {product.warrantyDuration} months {product.warrantyType}
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 border border-gray-100">
                <RotateCcw className="w-4 h-4 text-indigo-500" /> {product.returnPolicyDays} days return
              </div>
            </div>

            <Separator className="my-8 opacity-50" />

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-auto">
              <div className="flex items-center border border-gray-200 rounded-xl h-12 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full hover:bg-gray-50 rounded-l-xl transition-colors text-gray-500 hover:text-gray-900 flex items-center justify-center">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stockQuantity || 999, quantity + 1))} className="px-4 h-full hover:bg-gray-50 rounded-r-xl transition-colors text-gray-500 hover:text-gray-900 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 rounded-xl"
                disabled={product.stockStatus !== "in_stock" || addToCart.isPending}
                onClick={() => {
                  if (!isAuthenticated) { toast.error('Please log in to add items to cart'); return; }
                  addToCart.mutate({ productId: product.id, quantity });
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 sm:flex-none sm:w-32 h-12 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl"
                disabled={product.stockStatus !== "in_stock"}
                onClick={() => {
                  if (!isAuthenticated) { toast.error('Please log in first'); return; }
                  addToCart.mutate({ productId: product.id, quantity }, {
                    onSuccess: () => navigate('/checkout'),
                  });
                }}
              >
                Buy Now
              </Button>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 text-blue-800 mb-1">
                <Truck className="w-4 h-4" />
                <span className="font-medium text-sm">Delivery Information</span>
              </div>
              <p className="text-sm text-blue-600">Free shipping on orders over ৳5,000. Estimated delivery: 1-3 business days within Dhaka.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-white border-b rounded-none h-auto p-0">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4">Description</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4">Reviews ({product.reviews?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{product.fullDescription || product.shortDescription || "No description available."}</p>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              {Object.entries(specsByGroup).map(([group, specs]) => (
                <div key={group} className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{group}</h3>
                  <div className="border rounded-lg overflow-hidden">
                    {specs.map((spec, i) => (
                      <div key={spec.id} className={`flex justify-between px-4 py-3 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <span className="text-sm text-gray-600">{spec.specKey}</span>
                        <span className="text-sm font-medium text-gray-900">{spec.specValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(specsByGroup).length === 0 && <p className="text-gray-500">No specifications available.</p>}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(product.avgRating) || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">{product.avgRating} out of 5</span>
                    <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
                  </div>
                </div>
                {isAuthenticated && (
                  <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm">Write a Review</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 border-0 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Write a Review</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none hover:scale-110 transition-transform"
                              >
                                <Star className={`w-8 h-8 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="comment">Review</Label>
                          <Textarea
                            id="comment"
                            placeholder="What did you like or dislike?"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="min-h-[100px] rounded-xl border-gray-200 focus-visible:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => submitReview.mutate({ productId: product.id, rating: reviewRating, comment: reviewComment })}
                        disabled={submitReview.isPending || !reviewComment.trim()}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                      >
                        {submitReview.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review: any) => (
                    <div key={review.id} className="border border-gray-100 bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                            {review.user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                              {review.user?.name || "User"}
                              {review.isVerifiedPurchase && (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-[10px] px-1.5 py-0">Verified Buyer</Badge>
                              )}
                            </p>
                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No reviews yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts on this product!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {product.related && product.related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {product.related.map((p: any) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="group block">
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <PackageOpen className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight mb-2 min-h-[2.5rem]">{p.name}</h3>
                      <div className="flex items-end gap-1.5 mt-auto">
                        <p className="text-lg font-bold text-indigo-600 leading-none">{CURRENCY}{Number(p.salePrice || p.regularPrice).toLocaleString()}</p>
                        {p.salePrice && Number(p.salePrice) !== Number(p.regularPrice) && (
                          <p className="text-xs text-gray-400 line-through leading-none pb-0.5">{CURRENCY}{Number(p.regularPrice).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
