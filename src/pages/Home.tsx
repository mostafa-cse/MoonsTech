import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY } from "@/const";
import {
  Cpu, Monitor, Smartphone, Gamepad2, Wifi, Printer,
  Keyboard, ArrowRight, Star, TrendingUp, Zap, Clock, ChevronRight, ShoppingCart, Heart,
  ShieldCheck, Truck, RotateCcw, Headphones
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "computing-components": <Cpu className="w-6 h-6" />,
  "display-audio": <Monitor className="w-6 h-6" />,
  "mobile-gadgets": <Smartphone className="w-6 h-6" />,
  "gaming": <Gamepad2 className="w-6 h-6" />,
  "networking-security": <Wifi className="w-6 h-6" />,
  "office-equipment": <Printer className="w-6 h-6" />,
  "accessories": <Keyboard className="w-6 h-6" />,
};

function ProductCard({ product }: { product: any }) {
  const utils = trpc.useUtils();
  const { isAuthenticated } = useAuth();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); toast.success('Added to cart!'); },
    onError: (err) => toast.error(err.message),
  });
  const addToWishlist = trpc.wishlist.add.useMutation({
    onSuccess: () => toast.success('Added to wishlist!'),
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl">
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
              <Monitor className="w-12 h-12" />
            </div>
          )}
          {product.discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-rose-500 hover:bg-rose-600 shadow-sm">-{product.discount}%</Badge>
          )}
          {product.isNewArrival && (
            <Badge className="absolute top-3 right-3 bg-emerald-500 hover:bg-emerald-600 shadow-sm">New</Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.5rem] leading-tight">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-500">{product.avgRating} ({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-lg font-bold text-indigo-600">{CURRENCY}{Number(product.salePrice || product.regularPrice).toLocaleString()}</span>
            {product.salePrice && Number(product.salePrice) !== Number(product.regularPrice) && (
              <span className="text-xs text-gray-400 line-through ml-1">{CURRENCY}{Number(product.regularPrice).toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs h-8"
            disabled={addToCart.isPending}
            onClick={() => {
              if (!isAuthenticated) { toast.error('Please log in to add items to cart'); return; }
              addToCart.mutate({ productId: product.id, quantity: 1 });
            }}
          >
            <ShoppingCart className="w-3 h-3 mr-1" /> Add
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            disabled={addToWishlist.isPending}
            onClick={() => {
              if (!isAuthenticated) { toast.error('Please log in first'); return; }
              addToWishlist.mutate({ productId: product.id });
            }}
          >
            <Heart className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, link, icon }: { title: string; link?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { data: featured, isLoading: featuredLoading, isError: featuredError } = trpc.product.featured.useQuery();
  const { data: bestSellers, isLoading: bestLoading, isError: bestError } = trpc.product.bestSellers.useQuery();
  const { data: newArrivals, isLoading: newLoading, isError: newError } = trpc.product.newArrivals.useQuery();
  const { data: categoryTree } = trpc.category.tree.useQuery();

  const mainCategories = categoryTree?.slice(0, 7) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white overflow-hidden min-h-[500px] flex items-center">
        {/* Modern abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10 w-full">
          <div className="max-w-2xl backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
            <Badge className="bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 mb-6 border border-indigo-400/30 px-3 py-1">
              🚀 New Collection {new Date().getFullYear()}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 animate-pulse">Tech Experience</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 font-light leading-relaxed max-w-lg">
              Build your dream PC, discover cutting-edge electronics, and enjoy exclusive deals with MegaCoin rewards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-semibold rounded-xl h-14 px-8 transition-all hover:scale-105">
                  Shop Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/pc-builder">
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 hover:text-white rounded-xl h-14 px-8 backdrop-blur-sm transition-all">
                  <Cpu className="w-5 h-5 mr-2" /> PC Builder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeader title="Shop by Category" link="/products" icon={<Zap className="w-6 h-6 text-indigo-600" />} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {mainCategories.map((cat: any) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300 shadow-sm">
                {CATEGORY_ICONS[cat.slug] || <Cpu className="w-7 h-7" />}
              </div>
              <span className="text-sm font-semibold text-slate-700 text-center group-hover:text-indigo-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader title="Featured Products" link="/products?featured=true" icon={<Star className="w-5 h-5 text-yellow-500" />} />
          {featuredLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl glass" />)}
            </div>
          ) : featuredError ? (
            <div className="w-full h-40 glass rounded-2xl flex items-center justify-center text-red-500">
              Failed to load featured products.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featured?.slice(0, 6).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PC Builder CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '30px 30px'
            }} />
          </div>
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Badge className="bg-indigo-500 text-white mb-3">Interactive Tool</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Build Your Dream PC</h2>
              <p className="text-gray-400 max-w-lg">Select components, check compatibility, and build your perfect PC with our interactive builder tool.</p>
            </div>
            <Link to="/pc-builder">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                Start Building <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeader title="Best Sellers" link="/products?bestSeller=true" icon={<TrendingUp className="w-6 h-6 text-emerald-500" />} />
        {bestLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl glass" />)}
          </div>
        ) : bestError ? (
          <div className="w-full h-40 glass rounded-2xl flex items-center justify-center text-red-500">
            Failed to load best sellers.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {bestSellers?.slice(0, 5).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="bg-slate-50 border-y border-slate-200/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader title="New Arrivals" link="/products?newArrival=true" icon={<Clock className="w-6 h-6 text-indigo-500" />} />
          {newLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl glass" />)}
            </div>
          ) : newError ? (
            <div className="w-full h-40 glass rounded-2xl flex items-center justify-center text-red-500">
              Failed to load new arrivals.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {newArrivals?.slice(0, 5).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, title: "Genuine Products", desc: "100% authentic guarantee" },
            { icon: <Truck className="w-8 h-8 text-indigo-600" />, title: "Fast Delivery", desc: "Same-day in Dhaka" },
            { icon: <RotateCcw className="w-8 h-8 text-indigo-600" />, title: "Easy Returns", desc: "7-day return policy" },
            { icon: <Headphones className="w-8 h-8 text-indigo-600" />, title: "24/7 Support", desc: "Always here to help" },
          ].map((badge, i) => (
            <div key={i} className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300 text-indigo-600">
                {badge.icon}
              </div>
              <h3 className="font-bold text-slate-900">{badge.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
