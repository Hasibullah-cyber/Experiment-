import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Product, Category } from "@shared/schema";

export default function ProductsPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sort') || 'created',
    sortOrder: searchParams.get('order') || 'desc',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    featured: searchParams.get('featured') === 'true',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", filters, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.featured) params.append('featured', 'true');
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/products?${params}`);
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: selectedCategory } = useQuery({
    queryKey: ["/api/categories", filters.categoryId],
    queryFn: async () => {
      if (!filters.categoryId) return null;
      const response = await fetch(`/api/categories/${filters.categoryId}`);
      return response.json();
    },
    enabled: !!filters.categoryId,
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="text-sm amazon-light-text mb-4">
            <ol className="flex space-x-2">
              <li><a href="/" className="hover:text-primary">Home</a></li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li><a href="/products" className="hover:text-primary">Products</a></li>
              {selectedCategory && (
                <>
                  <li><ChevronRight className="h-4 w-4" /></li>
                  <li className="amazon-text">{selectedCategory.name}</li>
                </>
              )}
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold amazon-text">
                {filters.search ? `Search Results for "${filters.search}"` : 
                 selectedCategory ? selectedCategory.name : 'All Products'}
              </h1>
              {productsData && (
                <p className="amazon-light-text">
                  {productsData.total} results
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                handleFilterChange({ sortBy, sortOrder });
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created-desc">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search to find the perfect products
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <ProductFilters 
                      categories={categories || []}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Filters */}
            <div className="lg:w-1/4 hidden lg:block">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <ProductFilters 
                    categories={categories || []}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              {productsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : productsData?.products?.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsData.products.map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10"
                          >
                            {page}
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
