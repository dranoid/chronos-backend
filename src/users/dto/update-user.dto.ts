import { Role } from '../entities/role.enum';
export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: number;
  roles?: Role[];
}
