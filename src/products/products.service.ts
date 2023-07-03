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
import { OrderProductDto } from './dto/order-product.dto';
import { orderItem } from './interfaces/product.interface';

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

  async findAll(page: number, limit: number): Promise<any> {
    try {
      const items = await this.productModel.find();
      if (page && limit && limit > 0 && page > 0) {
        if (limit > items.length) {
          limit = items.length;
        }
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = items.slice(startIndex, endIndex);

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / limit);

        return {
          items: paginatedData,
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        };
      }
      return await this.productModel.find();
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw new NotFoundException('Product not found');
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
      if (!product) throw new NotFoundException('Item not found');
      return product;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findByIdAndDelete(id);
      if (!product) throw new NotFoundException('Item not found');
      return product;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const products = await this.productModel.find({ _id: { $in: productIds } });
    return products;
  }

  async orderValidation(
    orderProductDto: OrderProductDto[],
  ): Promise<orderItem[]> {
    // Fetch products from the database
    const productIds = orderProductDto.map(
      (orderProduct) => orderProduct.product,
    );
    const products = await this.productModel.find({ _id: { $in: productIds } });

    const updatedOrders: orderItem[] = [];
    for (const orderProduct of orderProductDto) {
      const product = products.find(
        (p) => p['_id'].toString() === orderProduct.product,
      );

      if (!product) {
        throw new Error(`Product '${orderProduct.product}' not found`);
      }
      const remainingQuantity = product.qty - orderProduct.orderQuantity;

      if (remainingQuantity < 0) {
        throw new Error(`Insufficient quantity for product '${product.name}'`);
      }

      updatedOrders.push({
        product: orderProduct.product,
        orderQuantity: orderProduct.orderQuantity,
      });
      product.qty = remainingQuantity;
      await product.save();
    }
    return updatedOrders;
  }
}
