export interface Product {
  id: number;
  name: string;
  article: string;
  photo_url?: string;
  description: string;
  sells_count_month: number;
  last_sell_dt: string | null;
  created_at: string;
  updated_at: string;
  userId: number;
  price: number;
  integration_kaspi: boolean;
  integration_wildberries: boolean;
  integration_ozon: boolean;
  best_seller: boolean;
  width: number;
  height: number;
  length: number;
  volume: number;
  weight: number;
}

export interface Pagination {
  page: number;
  size: number;
  totalPages: number;
  totalProducts: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ProductFilters {
  search?: string;
  platform?: string;
  hasStock?: boolean;
}
