import express from 'express';
import { PublisherController } from '../controllers/publisherController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', PublisherController.getPublishers);
router.get('/:publisherId', PublisherController.getPublisherById);
router.get('/:publisherId/articles', PublisherController.getPublisherArticles);
router.post('/:publisherId/subscribe', authenticate, PublisherController.subscribe);
router.delete('/:publisherId/subscribe', authenticate, PublisherController.unsubscribe);

export default router;
