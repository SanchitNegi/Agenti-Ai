import { Request, Response } from 'express';
import { ProductService } from '@/services/products.service';
import { AppError } from '@/utils/AppError';

const productService = new ProductService();

export async function getProducts(_req: Request, res: Response): Promise<void> {
  const products = await productService.findAll();
  res.status(200).json({ status: 'success', data: products });
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const product = await productService.findById(id);
  if (!product) throw new AppError(`Product ${id} not found`, 404);
  res.status(200).json({ status: 'success', data: product });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const product = await productService.create(req.body);
  res.status(201).json({ status: 'success', data: product });
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const product = await productService.update(id, req.body);
  if (!product) throw new AppError(`Product ${id} not found`, 404);
  res.status(200).json({ status: 'success', data: product });
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const deleted = await productService.remove(id);
  if (!deleted) throw new AppError(`Product ${id} not found`, 404);
  res.status(200).json({ status: 'success', data: null });
}
