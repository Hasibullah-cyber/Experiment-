import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  Menu,
  Package,
  Settings,
  LogOut,
} from "lucide-react";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cartItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="amazon-navy text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">ShopCenter</h1>
            </Link>
            <div className="hidden md:flex items-center space-x-1 hover:bg-[hsl(185,100%,30%)] px-2 py-1 rounded cursor-pointer">
              <MapPin className="h-4 w-4" />
              <div className="text-xs">
                <div className="text-gray-300">Deliver to</div>
                <div className="font-semibold">New York 10001</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="flex">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-l-md rounded-r-none border-0 text-black focus-visible:ring-0"
              />
              <Button
                type="submit"
                className="amazon-orange hover:amazon-yellow rounded-l-none"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Account & Cart */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center space-x-1 hover:bg-[hsl(185,100%,30%)] px-2 py-1 text-white">
                    <User className="h-4 w-4" />
                    <div className="text-xs text-left">
                      <div className="text-gray-300">Hello, {user?.firstName || 'User'}</div>
                      <div className="font-semibold">Account & Lists</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild className="hidden md:flex items-center space-x-1 hover:bg-[hsl(185,100%,30%)] px-2 py-1 text-white">
                <a href="/api/login">
                  <User className="h-4 w-4" />
                  <div className="text-xs">
                    <div className="text-gray-300">Hello, Sign in</div>
                    <div className="font-semibold">Account & Lists</div>
                  </div>
                </a>
              </Button>
            )}

            <Button variant="ghost" asChild className="flex items-center space-x-1 hover:bg-[hsl(185,100%,30%)] px-2 py-1 relative text-white">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs amazon-orange text-black">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div className="pb-4 border-b">
                        <p className="font-medium">Hello, {user?.firstName || 'User'}</p>
                      </div>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/orders" onClick={() => setIsMenuOpen(false)}>
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <a href="/api/logout">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </a>
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/api/login">
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </a>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Secondary Navigation */}
        <nav className="border-t border-[hsl(185,100%,30%)] py-2">
          <div className="flex items-center space-x-6 text-sm">
            <Link 
              href="/products" 
              className="hover:text-[hsl(35,100%,50%)] transition-colors"
            >
              All Categories
            </Link>
            <Link 
              href="/products?featured=true" 
              className="hover:text-[hsl(35,100%,50%)] transition-colors"
            >
              Today's Deals
            </Link>
            <Link 
              href="/products?category=electronics" 
              className="hover:text-[hsl(35,100%,50%)] transition-colors hidden md:inline"
            >
              Electronics
            </Link>
            <Link 
              href="/products?category=fashion" 
              className="hover:text-[hsl(35,100%,50%)] transition-colors hidden md:inline"
            >
              Fashion
            </Link>
            <Link 
              href="/products?category=home" 
              className="hover:text-[hsl(35,100%,50%)] transition-colors hidden md:inline"
            >
              Home & Garden
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
