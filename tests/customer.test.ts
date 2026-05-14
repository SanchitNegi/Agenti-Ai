describe('CustomerService', () => {
  it('should return an empty array by default', async () => {
    const { CustomerService } = await import('../src/services/customer.service');
    const service = new CustomerService();
    const result = await service.findAll();
    expect(result).toEqual([]);
  });

  it('should return null for unknown id', async () => {
    const { CustomerService } = await import('../src/services/customer.service');
    const service = new CustomerService();
    const result = await service.findById('unknown');
    expect(result).toBeNull();
  });
});
