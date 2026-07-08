import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY } from "@/const";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  Cpu, Monitor, Smartphone, Gamepad2, Wifi, Printer,
  Keyboard, ArrowRight, Star, TrendingUp, Zap, Clock, ChevronRight, ShoppingCart, Heart,
  ShieldCheck, Truck, RotateCcw, Headphones
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { motion, type Variants } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "computing-components": <Cpu className="w-6 h-6" />,
  "display-audio": <Monitor className="w-6 h-6" />,
  "mobile-gadgets": <Smartphone className="w-6 h-6" />,
  "gaming": <Gamepad2 className="w-6 h-6" />,
  "networking-security": <Wifi className="w-6 h-6" />,
  "office-equipment": <Printer className="w-6 h-6" />,
  "accessories": <Keyboard className="w-6 h-6" />,
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

function ProductCard({ product }: { product: any }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const addToCart = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/cart", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cart"] }); toast.success('Added to cart!'); },
    onError: (err: any) => toast.error(err.message || "Failed to add to cart"),
  });
  const addToWishlist = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/wishlist", data),
    onSuccess: () => toast.success('Added to wishlist!'),
    onError: (err: any) => toast.error(err.message || "Failed to add to wishlist"),
  });

  return (
    <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="h-full">
      <Card className="h-full group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden border-gray-100/50 bg-white/70 backdrop-blur-xl rounded-2xl flex flex-col">
        <Link to={`/product/${product.slug}`} className="flex-shrink-0">
          <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
            {product.image ? (
              <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                <Monitor className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            {product.discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-rose-500 hover:bg-rose-600 shadow-sm border-0 font-semibold px-2 py-0.5">-{product.discount}%</Badge>
            )}
            {product.isNewArrival && (
              <Badge className="absolute top-3 right-3 bg-emerald-500 hover:bg-emerald-600 shadow-sm border-0 font-semibold px-2 py-0.5">New</Badge>
            )}
          </div>
        </Link>
        <CardContent className="p-5 flex flex-col flex-grow">
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-[15px] font-bold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.5rem] leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-600">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              <span className="text-xs font-bold">{product.avgRating || "0.0"}</span>
            </div>
            <span className="text-xs font-medium text-gray-400">({product.reviewCount || 0})</span>
          </div>
          
          <div className="mt-auto pt-4 flex items-end justify-between">
            <div className="flex flex-col">
              {product.salePrice && Number(product.salePrice) !== Number(product.regularPrice) && (
                <span className="text-xs text-gray-400 line-through font-medium leading-none mb-1">{CURRENCY}{Number(product.regularPrice).toLocaleString()}</span>
              )}
              <span className="text-lg font-black text-indigo-600 leading-none">{CURRENCY}{Number(product.salePrice || product.regularPrice).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1 bg-gray-900 hover:bg-indigo-600 text-white text-xs h-9 font-semibold transition-colors duration-300 shadow-md"
              disabled={addToCart.isPending}
              onClick={() => {
                if (!isAuthenticated) { toast.error('Please log in to add items to cart'); return; }
                addToCart.mutate({ productId: product.id, quantity: 1 });
              }}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-9 w-9 p-0 border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors duration-300 shadow-sm"
              disabled={addToWishlist.isPending}
              onClick={() => {
                if (!isAuthenticated) { toast.error('Please log in first'); return; }
                addToWishlist.mutate({ productId: product.id });
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SectionHeader({ title, link, icon }: { title: string; link?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-xl">
          {icon}
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors">
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { data: featured, isLoading: featuredLoading, isError: featuredError } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await apiClient.get("/product?featured=true");
      return data;
    }
  });
  const { data: bestSellers, isLoading: bestLoading, isError: bestError } = useQuery({
    queryKey: ["products", "bestSellers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/product?bestSeller=true");
      return data;
    }
  });
  const { data: newArrivals, isLoading: newLoading, isError: newError } = useQuery({
    queryKey: ["products", "newArrivals"],
    queryFn: async () => {
      const { data } = await apiClient.get("/product?newArrival=true");
      return data;
    }
  });
  const { data: categoryTree } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => []
  });

  // Default empty arrays if undefined so we can check length
  const featuredArr = Array.isArray(featured) ? featured : (featured?.items || featured?.value || []);
  const bestSellersArr = Array.isArray(bestSellers) ? bestSellers : (bestSellers?.items || bestSellers?.value || []);
  const newArrivalsArr = Array.isArray(newArrivals) ? newArrivals : (newArrivals?.items || newArrivals?.value || []);

  const mainCategories = categoryTree?.slice(0, 7) || [
    { id: '1', slug: 'computing-components', name: 'PC Components' },
    { id: '2', slug: 'display-audio', name: 'Monitors' },
    { id: '3', slug: 'mobile-gadgets', name: 'Mobile' },
    { id: '4', slug: 'gaming', name: 'Gaming' },
  ]; // Fallback for UI visualization if API is empty

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-[#09090b] text-white overflow-hidden min-h-[600px] flex items-center">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 100, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] -left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen" 
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10 w-full flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center md:text-left"
          >
            <Badge className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 mb-8 border border-indigo-400/20 px-4 py-1.5 rounded-full backdrop-blur-md">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                New Collection {new Date().getFullYear()} is here
              </span>
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              Next-Gen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">Technology.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
              Build your ultimate setup with our premium selection of components, gadgets, and peripherals. Unbeatable prices, guaranteed.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/products">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] font-bold rounded-full h-14 px-8 transition-all hover:scale-105 active:scale-95">
                  Explore Products <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/pc-builder">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full h-14 px-8 backdrop-blur-md transition-all">
                  <Cpu className="w-5 h-5 mr-2" /> PC Builder
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex-1 hidden md:block perspective-1000"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
               {/* Abstract Hero Image Representation */}
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-2xl flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-10 text-center">
                    <Monitor className="w-32 h-32 text-white/80 mx-auto mb-4 animate-pulse" />
                    <div className="text-white/90 font-bold text-xl tracking-widest uppercase">Premium Gear</div>
                  </div>
               </div>
               
               {/* Floating Badges */}
               <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl"
               >
                 <div className="flex items-center gap-3">
                   <div className="bg-emerald-500/20 p-2 rounded-lg"><Star className="w-6 h-6 text-emerald-400" /></div>
                   <div>
                     <div className="text-white font-bold">4.9/5</div>
                     <div className="text-white/60 text-xs">Customer Rating</div>
                   </div>
                 </div>
               </motion.div>
               
               <motion.div 
                animate={{ y: [0, 20, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl"
               >
                 <div className="flex items-center gap-3">
                   <div className="bg-indigo-500/20 p-2 rounded-lg"><Truck className="w-6 h-6 text-indigo-400" /></div>
                   <div>
                     <div className="text-white font-bold">Free Shipping</div>
                     <div className="text-white/60 text-xs">On orders over {CURRENCY}50k</div>
                   </div>
                 </div>
               </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges - Moved up for immediate validation */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100"
          >
            {[
              { icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />, title: "100% Genuine", desc: "Authentic guarantee" },
              { icon: <Truck className="w-6 h-6 text-indigo-600" />, title: "Fast Delivery", desc: "Same-day in Dhaka" },
              { icon: <RotateCcw className="w-6 h-6 text-indigo-600" />, title: "Easy Returns", desc: "7-day return policy" },
              { icon: <Headphones className="w-6 h-6 text-indigo-600" />, title: "24/7 Support", desc: "Always here to help" },
            ].map((badge, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 text-indigo-600">
                  {badge.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{badge.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <SectionHeader title="Shop by Category" link="/products" icon={<Zap className="w-6 h-6 text-indigo-600" />} />
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
        >
          {mainCategories.map((cat: any) => (
            <motion.div key={cat.id} variants={fadeInUp}>
              <Link
                to={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-sm">
                  {CATEGORY_ICONS[cat.slug] || <Cpu className="w-8 h-8" />}
                </div>
                <span className="text-sm font-bold text-gray-700 text-center group-hover:text-indigo-700">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products Carousel */}
      <section className="bg-gray-50/50 py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <SectionHeader title="Featured Products" link="/products?featured=true" icon={<Star className="w-6 h-6 text-amber-500" />} />
          </motion.div>
          
          {featuredLoading ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="min-w-[280px] h-[400px] rounded-2xl" />)}
            </div>
          ) : featuredError || featuredArr.length === 0 ? (
            <div className="w-full h-48 bg-white border border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-500">
              No featured products found.
            </div>
          ) : (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 md:-ml-6">
                  {featuredArr.map((product: any) => (
                    <CarouselItem key={product.id} className="pl-4 md:pl-6 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <div className="p-1 h-full">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="-left-4 bg-white hover:bg-indigo-50 border-gray-200" />
                  <CarouselNext className="-right-4 bg-white hover:bg-indigo-50 border-gray-200" />
                </div>
              </Carousel>
            </motion.div>
          )}
        </div>
      </section>

      {/* PC Builder CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="bg-gray-950 rounded-[2.5rem] overflow-hidden relative shadow-2xl"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent" />
          </div>
          <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <Badge className="bg-indigo-600 text-white mb-4 border-0 hover:bg-indigo-600 px-3 py-1">Advanced Tool</Badge>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Build Your Ultimate Setup</h2>
              <p className="text-gray-400 text-lg md:text-xl">Ensure perfect compatibility and see the total cost instantly. Our PC builder makes assembling your next rig effortless.</p>
            </div>
            <Link to="/pc-builder" className="shrink-0">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full h-16 px-10 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                Start Building <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <SectionHeader title="Best Sellers" link="/products?bestSeller=true" icon={<TrendingUp className="w-6 h-6 text-emerald-500" />} />
        </motion.div>
        
        {bestLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : bestError || bestSellersArr.length === 0 ? (
          <div className="w-full h-40 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 bg-gray-50">
            No best sellers available at the moment.
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {bestSellersArr.slice(0, 5).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </section>

    </Layout>
  );
}
