import { Request, Response } from 'express';
import { CustomerService } from '@/services/customer.service';
import { AppError } from '@/utils/AppError';

const customerService = new CustomerService();

export async function getCustomers(_req: Request, res: Response): Promise<void> {
  const customers = await customerService.findAll();
  res.status(200).json({ status: 'success', data: customers });
}

export async function getCustomerById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const customer = await customerService.findById(id as string);
  if (!customer) throw new AppError(`Customer ${id} not found`, 404);
  res.status(200).json({ status: 'success', data: customer });
}
