import type { Product, CreateProductDto, UpdateProductDto } from '@/types/index';

export class ProductService {
  async findAll(): Promise<Product[]> {
    return [];
  }

  async findById(id: string): Promise<Product | null> {
    return null;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return {
      id: crypto.randomUUID(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product | null> {
    return null;
  }

  async remove(id: string): Promise<boolean> {
    return false;
  }
}
