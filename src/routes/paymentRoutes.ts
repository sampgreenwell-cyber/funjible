import express from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { validate, addPaymentMethodSchema } from '../middleware/validation';

const router = express.Router();

router.get('/', authenticate, PaymentController.getPaymentMethods);
router.post('/', authenticate, validate(addPaymentMethodSchema), PaymentController.addPaymentMethod);
router.put('/:paymentMethodId/default', authenticate, PaymentController.setDefaultPaymentMethod);
router.delete('/:paymentMethodId', authenticate, PaymentController.removePaymentMethod);

export default router;