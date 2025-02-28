export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stockCount: number;
  brand: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    category: "Laptopy",
    description: "Laptop Apple z procesorem M1 Pro, 16GB RAM, 512GB SSD",
    price: 9999.99,
    stockCount: 15,
    brand: "Apple",
    imageUrl: "https://example.com/macbook.jpg",
    isAvailable: true,
    createdAt: "2023-01-15T14:30:00Z",
  },
];
