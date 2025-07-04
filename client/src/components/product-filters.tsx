import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, X } from "lucide-react";
import type { Category } from "@shared/schema";

interface ProductFiltersProps {
  categories: Category[];
  filters: {
    categoryId: string;
    search: string;
    sortBy: string;
    sortOrder: string;
    minPrice: string;
    maxPrice: string;
    brand: string;
    featured: boolean;
  };
  onFilterChange: (filters: Partial<ProductFiltersProps['filters']>) => void;
}

export default function ProductFilters({ categories, filters, onFilterChange }: ProductFiltersProps) {
  const handleClearFilters = () => {
    onFilterChange({
      categoryId: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      featured: false,
    });
  };

  const activeFiltersCount = [
    filters.categoryId,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.brand,
    filters.featured,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold amazon-text">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold amazon-text mb-3">Category</h4>
        <RadioGroup
          value={filters.categoryId}
          onValueChange={(value) => onFilterChange({ categoryId: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="all-categories" />
            <Label htmlFor="all-categories" className="text-sm">All Categories</Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem value={category.id.toString()} id={`category-${category.id}`} />
              <Label htmlFor={`category-${category.id}`} className="text-sm">
                {category.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold amazon-text mb-3">Price Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-price" className="text-xs">Min</Label>
            <Input
              id="min-price"
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="max-price" className="text-xs">Max</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="999+"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              className="text-sm"
            />
          </div>
        </div>
        
        {/* Quick Price Filters */}
        <div className="mt-3 space-y-2">
          <button
            className="block w-full text-left text-sm hover:text-primary"
            onClick={() => onFilterChange({ minPrice: '', maxPrice: '25' })}
          >
            Under $25
          </button>
          <button
            className="block w-full text-left text-sm hover:text-primary"
            onClick={() => onFilterChange({ minPrice: '25', maxPrice: '100' })}
          >
            $25 - $100
          </button>
          <button
            className="block w-full text-left text-sm hover:text-primary"
            onClick={() => onFilterChange({ minPrice: '100', maxPrice: '500' })}
          >
            $100 - $500
          </button>
          <button
            className="block w-full text-left text-sm hover:text-primary"
            onClick={() => onFilterChange({ minPrice: '500', maxPrice: '' })}
          >
            Over $500
          </button>
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="font-semibold amazon-text mb-3">Brand</h4>
        <Input
          placeholder="Search brands..."
          value={filters.brand}
          onChange={(e) => onFilterChange({ brand: e.target.value })}
          className="text-sm"
        />
        
        {/* Popular Brands */}
        <div className="mt-3 space-y-2">
          {['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Nike', 'Adidas'].map((brand) => (
            <button
              key={brand}
              className="block w-full text-left text-sm hover:text-primary"
              onClick={() => onFilterChange({ brand })}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div>
        <h4 className="font-semibold amazon-text mb-3">Customer Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className="flex items-center space-x-2 text-sm hover:text-primary w-full text-left"
            >
              <div className="flex">
                {Array.from({ length: rating }, (_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                {Array.from({ length: 5 - rating }, (_, i) => (
                  <Star key={i} className="h-3 w-3 text-gray-300" />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={filters.featured}
            onCheckedChange={(checked) => onFilterChange({ featured: !!checked })}
          />
          <Label htmlFor="featured" className="text-sm">
            Featured Products Only
          </Label>
        </div>
      </div>
    </div>
  );
}
