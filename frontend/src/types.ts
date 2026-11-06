export interface Category { id: string; name: string; slug: string; products?: number }
export interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; offerPrice: number | null; stock: number;
  active: boolean; featured: boolean; categoryId: string | null;
  category: Category | null; images: { id: string; url: string }[];
}
export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
export interface Order {
  id: string; number: number; customerName: string; phone: string; notes: string;
  total: number; status: OrderStatus; createdAt: string;
  items: { id: string; name: string; unitPrice: number; quantity: number }[];
}
