import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
} from "lucide-react";

export default function AdminProducts() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { search: searchQuery, page: currentPage }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", itemsPerPage.toString());
      params.append("offset", ((currentPage - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/products?${params}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted",
      });
      setDeleteProductId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isAuthenticated, authLoading, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleDeleteProduct = (productId: number) => {
    deleteProductMutation.mutate(productId);
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold amazon-text">Products Management</h1>
                <p className="text-muted-foreground">
                  Manage your product catalog
                </p>
              </div>
            </div>
            
            <Button asChild className="amazon-button">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  All Products ({productsData?.total || 0})
                </CardTitle>
                
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardHeader>
            
            <CardContent>
              {productsData?.products?.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsData.products.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images?.[0] || "/api/placeholder/50/50"}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {product.brand}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category?.name || "No Category"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                ${parseFloat(product.salePrice || product.price).toFixed(2)}
                              </p>
                              {product.salePrice && (
                                <p className="text-sm text-muted-foreground line-through">
                                  ${parseFloat(product.price).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                            >
                              {product.stock || 0} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={product.isActive ? "default" : "secondary"}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/product/${product.slug}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/products/${product.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteProductId(product.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
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
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "No products match your search criteria" 
                      : "Start by adding your first product"
                    }
                  </p>
                  <Button asChild className="amazon-button">
                    <Link href="/admin/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDeleteProduct(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
