import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from 'src/products/interfaces/product.interface';
import { Role } from '../entities/role.enum';

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  order: Product[];

  @Prop()
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
