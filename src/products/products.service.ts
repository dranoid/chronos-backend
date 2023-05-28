import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schema/products.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    try {
      await product.save();
      return product;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await this.productModel.find();
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw new NotFoundException('User not found');
      return product;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const product = await this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
        {
          new: true,
        },
      );
      if (!product) throw new NotFoundException('User not found');
      return product;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findByIdAndDelete(id);
      if (!product) throw new NotFoundException('User not found');
      return product;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
