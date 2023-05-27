import { Product } from 'src/products/interfaces/product.interface';
export interface User {
  name: string;
  email: string;
  password: string;
  order?: Product[];
}
