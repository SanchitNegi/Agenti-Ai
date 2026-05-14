import { Router } from 'express';
import customerRoutes from './customer.routes';
import productRoutes from './products.routes';

const router = Router();

router.use('/customers', customerRoutes);
router.use('/products', productRoutes);

export default router;
