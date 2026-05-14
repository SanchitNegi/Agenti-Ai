import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/controllers/products.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { asyncWrapper } from '@/utils/asyncWrapper';

const router = Router();

router.use(authMiddleware);

router.get('/',      asyncWrapper(getProducts));
router.get('/:id',   asyncWrapper(getProductById));
router.post('/',     asyncWrapper(createProduct));
router.put('/:id',   asyncWrapper(updateProduct));
router.delete('/:id', asyncWrapper(deleteProduct));

export default router;
