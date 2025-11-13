export interface Warehouse {
  address: string;
  cells: Cell[];
  city: string;
  created_at: Date;
  id: number;
  name: string;
  updatedAt: Date;
}

export interface Cell {
  article: string;
  created_at: Date;
  entites: Entite[];
  id: number;
  name: string;
  rack: number;
  row: number;
  storageId: number;
  updated_at: Date;
}

export interface Entite {
  cellId: number;
  count: number;
  created_at: Date;
  id: number;
  ownerId: number;
  product: Product;
  productId: number;
  updated_at: Date;
}

export interface Product {
  article: string;
  best_seller: boolean;
  created_at: Date;
  description: string;
  id: number;
  integration_kaspi: boolean;
  integration_ozon: boolean;
  integration_wildberries: boolean;
  last_sell_dt: null;
  name: string;
  photo_url: string;
  price: number;
  sells_count_month: number;
  updated_at: Date;
  userId: number;
}
