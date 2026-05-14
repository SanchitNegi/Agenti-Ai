import { Router } from 'express';
import { getCustomers, getCustomerById } from '@/controllers/customer.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { asyncWrapper } from '@/utils/asyncWrapper';

const router = Router();

router.use(authMiddleware);

router.get('/',    asyncWrapper(getCustomers));
router.get('/:id', asyncWrapper(getCustomerById));

export default router;
