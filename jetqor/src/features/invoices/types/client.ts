export interface ClientInvoiceProduct {
  count: number;
  productId: number;
}

export interface CreateClientInvoiceDto {
  storageId: number;
  products: ClientInvoiceProduct[];
  type?: "incoming" | "consumable" | "internal" | "return";
}

export interface ClientSelectedProduct extends ClientInvoiceProduct {
  name: string;
  article: string;
  imageUrl?: string;
  price: number;
}
