import type { Customer } from '@/types/index';

export class CustomerService {
  async findAll(): Promise<Customer[]> {
    return [];
  }

  async findById(id: string): Promise<Customer | null> {
    return null;
  }
}
