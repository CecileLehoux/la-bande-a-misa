import type { Product, Category, Order, OrderItem, User, ProductImage } from "@prisma/client"

export type ProductWithImages = Product & {
  images: ProductImage[]
  categories: { category: Category }[]
  _count?: { reviews: number }
}

export type ProductWithDetails = ProductWithImages & {
  reviews: ReviewWithUser[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product & { images: ProductImage[] } })[]
  user: User | null
}

export type ReviewWithUser = {
  id: string
  rating: number
  title: string | null
  comment: string | null
  createdAt: Date
  user: { name: string | null; image: string | null }
}

export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  stock: number
  size?: string
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
}
