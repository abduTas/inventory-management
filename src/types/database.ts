export type Profile = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  telegram_chat_id: string | null;
  push_alerts_enabled: boolean;
};

export type Organization = {
  id: string;
  name: string;
  currency: string;
  onboarding_completed: boolean;
};

export type Store = {
  id: string;
  org_id: string;
  name: string;
  timezone: string;
  default_reorder_level: number;
  tax_rate: number;
};

export type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  sku: string;
  name: string;
  barcode: string | null;
  cost_price: number;
  sell_price: number;
  reorder_level: number | null;
  image_url: string | null;
  last_alerted_at: string | null;
  is_active: boolean;
  inventory_levels?: { quantity_on_hand: number } | { quantity_on_hand: number }[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export function getStockQty(product: Product): number {
  const inv = product.inventory_levels;
  if (!inv) return 0;
  if (Array.isArray(inv)) return inv[0]?.quantity_on_hand ?? 0;
  return inv.quantity_on_hand ?? 0;
}

export function getEffectiveThreshold(
  product: Product,
  storeDefault = 30
): number {
  return product.reorder_level ?? storeDefault;
}

export function isLowStock(product: Product, storeDefault = 30): boolean {
  return getStockQty(product) <= getEffectiveThreshold(product, storeDefault);
}
