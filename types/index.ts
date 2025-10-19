export interface ProductSearchResult {
  _id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  score: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
}
