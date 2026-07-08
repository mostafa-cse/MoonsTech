import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, ShoppingCart, User, Menu, Heart, Cpu,
  ChevronDown, LogOut, Package, Coins,
  MapPin, ShieldCheck, Zap
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, isDeliveryMan, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: categoryTree } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Mock categories for now until CategoryController is implemented on .NET side
      return [];
    }
  });
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cart");
      return data;
    },
    enabled: isAuthenticated
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const cartItemCount = cartData?.itemCount || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-xs py-2 px-4 text-center">
        <span className="font-medium">🎉 Summer Tech Sale!</span> Up to 30% off on selected electronics. Free shipping on orders over ৳5,000
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                Aesthetic Tech
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products, brands, categories..."
                  className="pl-10 pr-4 h-10 bg-gray-100 border-0 focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* PC Builder */}
              <Link to="/pc-builder">
                <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-1.5 text-indigo-600">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs font-medium">PC Builder</span>
                </Button>
              </Link>

              {/* Wishlist */}
              <Link to="/account/wishlist">
                <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative hidden sm:flex">
                  <Heart className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Account */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="hidden sm:inline text-sm">{user?.name?.split(" ")[0]}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <User className="w-4 h-4 mr-2" /> My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account/orders")}>
                      <Package className="w-4 h-4 mr-2" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account/megacoin")}>
                      <Coins className="w-4 h-4 mr-2" /> MegaCoin
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldCheck className="w-4 h-4 mr-2" /> Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {isDeliveryMan && (
                      <DropdownMenuItem onClick={() => navigate("/delivery")}>
                        <Package className="w-4 h-4 mr-2" /> Delivery Portal
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/signup")}>
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle Menu" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                      <Button type="submit" size="icon" aria-label="Search"><Search className="w-4 h-4" /></Button>
                    </form>
                    <nav className="space-y-2">
                      <Link to="/pc-builder" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <Cpu className="w-4 h-4" /> PC Builder
                      </Link>
                      <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <ShoppingCart className="w-4 h-4" /> Cart ({cartItemCount})
                      </Link>
                      <Link to="/account/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                        <Heart className="w-4 h-4" /> Wishlist
                      </Link>
                      {isAuthenticated ? (
                        <>
                          <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                            <User className="w-4 h-4" /> My Account
                          </Link>
                          {isAdmin && (
                            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                              <ShieldCheck className="w-4 h-4" /> Admin
                            </Link>
                          )}
                          <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-red-600 w-full">
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 text-gray-900 justify-center">
                            Login
                          </Link>
                          <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg bg-indigo-600 text-white justify-center">
                            Sign Up
                          </Link>
                        </div>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <nav className="border-t bg-white hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1 h-11 overflow-x-auto">
              {categoryTree?.map((cat: any) => (
                <div key={cat.id} className="relative group">
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 whitespace-nowrap transition-colors"
                  >
                    {cat.name}
                    {cat.children?.length > 0 && <ChevronDown className="w-3 h-3" />}
                  </Link>
                  {cat.children?.length > 0 && (
                    <div className="absolute top-full left-0 bg-white shadow-lg border rounded-lg py-2 min-w-[200px] hidden group-hover:block z-50">
                      {cat.children.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/products?category=${sub.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Aesthetic Tech</span>
              </div>
              <p className="text-sm text-gray-400">
                Bangladesh's premier destination for tech enthusiasts. Quality products, competitive prices, and exceptional service.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/pc-builder" className="text-gray-400 hover:text-white transition-colors">PC Builder</Link></li>
                <li><Link to="/track" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-3">
                <li><Link to="/account" className="text-gray-400 hover:text-white transition-colors">My Account</Link></li>
                <li><Link to="/cart" className="text-gray-400 hover:text-white transition-colors">Cart</Link></li>
                <li><Link to="/track" className="text-gray-400 hover:text-white transition-colors">Order Tracking</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Dhaka, Bangladesh</li>
                <li>support@aesthetictech.com</li>
                <li>+880 1XXX-XXXXXX</li>
              </ul>
              <div className="flex gap-3 mt-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs font-bold">in</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs font-bold">IG</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Aesthetic Tech Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
