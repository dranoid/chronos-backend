import { Product } from 'src/products/interfaces/product.interface';
import { Role } from '../entities/role.enum';

export class SanitizeUserDto {
  readonly _id: string;
  readonly name: string;
  readonly email: string;
  readonly order: Product[];
  readonly roles: Role[];
}
