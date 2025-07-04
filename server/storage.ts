import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  reviews,
  wishlist,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Review,
  type InsertReview,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product operations
  getAllProducts(params?: {
    categoryId?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    featured?: boolean;
  }): Promise<{ products: Product[]; total: number }>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  // Order operations
  getAllOrders(params?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; total: number }>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getUserOrders(userId: string): Promise<Order[]>;
  
  // Order items operations
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Wishlist operations
  getUserWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(item: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<boolean>;
  
  // Analytics operations
  getDashboardStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Order[];
    topProducts: (Product & { soldCount: number; revenue: number })[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Product operations
  async getAllProducts(params?: {
    categoryId?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    featured?: boolean;
  }): Promise<{ products: Product[]; total: number }> {
    let query = db.select().from(products);
    let countQuery = db.select({ count: count() }).from(products);

    const conditions = [];
    conditions.push(eq(products.isActive, true));

    if (params?.categoryId) {
      conditions.push(eq(products.categoryId, params.categoryId));
    }

    if (params?.search) {
      conditions.push(
        or(
          like(products.name, `%${params.search}%`),
          like(products.description, `%${params.search}%`),
          like(products.brand, `%${params.search}%`)
        )
      );
    }

    if (params?.minPrice) {
      conditions.push(sql`${products.price} >= ${params.minPrice}`);
    }

    if (params?.maxPrice) {
      conditions.push(sql`${products.price} <= ${params.maxPrice}`);
    }

    if (params?.brand) {
      conditions.push(eq(products.brand, params.brand));
    }

    if (params?.featured) {
      conditions.push(eq(products.isFeatured, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    // Sorting
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === "desc" ? desc : asc;
      switch (params.sortBy) {
        case "price":
          query = query.orderBy(sortOrder(products.price));
          break;
        case "name":
          query = query.orderBy(sortOrder(products.name));
          break;
        case "rating":
          query = query.orderBy(sortOrder(products.rating));
          break;
        case "created":
          query = query.orderBy(sortOrder(products.createdAt));
          break;
        default:
          query = query.orderBy(desc(products.createdAt));
      }
    } else {
      query = query.orderBy(desc(products.createdAt));
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.offset(params.offset);
    }

    const [productResults, countResults] = await Promise.all([
      query,
      countQuery,
    ]);

    return {
      products: productResults,
      total: countResults[0]?.count || 0,
    };
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
      .orderBy(desc(products.rating))
      .limit(limit);
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, item.userId!),
          eq(cartItems.productId, item.productId!)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + item.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount > 0;
  }

  // Order operations
  async getAllOrders(params?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    let query = db.select().from(orders);
    let countQuery = db.select({ count: count() }).from(orders);

    const conditions = [];

    if (params?.userId) {
      conditions.push(eq(orders.userId, params.userId));
    }

    if (params?.status) {
      conditions.push(eq(orders.status, params.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    query = query.orderBy(desc(orders.createdAt));

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.offset(params.offset);
    }

    const [orderResults, countResults] = await Promise.all([
      query,
      countQuery,
    ]);

    return {
      orders: orderResults,
      total: countResults[0]?.count || 0,
    };
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    return await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }

  // Review operations
  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    return await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Wishlist operations
  async getUserWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    return await db
      .select()
      .from(wishlist)
      .innerJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.createdAt));
  }

  async addToWishlist(item: InsertWishlist): Promise<Wishlist> {
    const [newItem] = await db.insert(wishlist).values(item).returning();
    return newItem;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<boolean> {
    const result = await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
    return result.rowCount > 0;
  }

  // Analytics operations
  async getDashboardStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Order[];
    topProducts: (Product & { soldCount: number; revenue: number })[];
  }> {
    const [salesResult] = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${orders.total}), 0)::numeric`,
        totalOrders: count(),
      })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));

    const [productsResult] = await db
      .select({ totalProducts: count() })
      .from(products)
      .where(eq(products.isActive, true));

    const [customersResult] = await db
      .select({ totalCustomers: count() })
      .from(users)
      .where(eq(users.role, "customer"));

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        images: products.images,
        soldCount: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::numeric`,
        revenue: sql<number>`COALESCE(SUM(${orderItems.total}), 0)::numeric`,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .groupBy(products.id)
      .orderBy(desc(sql`COALESCE(SUM(${orderItems.quantity}), 0)`))
      .limit(5);

    return {
      totalSales: Number(salesResult.totalSales) || 0,
      totalOrders: salesResult.totalOrders || 0,
      totalProducts: productsResult.totalProducts || 0,
      totalCustomers: customersResult.totalCustomers || 0,
      recentOrders,
      topProducts: topProducts.map(p => ({
        ...p,
        slug: `product-${p.id}`,
        description: null,
        shortDescription: null,
        salePrice: null,
        sku: null,
        stock: 0,
        categoryId: null,
        brand: null,
        rating: "0",
        reviewCount: 0,
        isActive: true,
        isFeatured: false,
        weight: null,
        dimensions: null,
        tags: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        soldCount: Number(p.soldCount) || 0,
        revenue: Number(p.revenue) || 0,
      })),
    };
  }
}

export const storage = new DatabaseStorage();
