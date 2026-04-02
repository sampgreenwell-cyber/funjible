import express from 'express';
import { ArticleController } from '../controllers/articleController';
import { authenticate } from '../middleware/auth';
import { validate, purchaseArticleSchema } from '../middleware/validation';

const router = express.Router();

router.post('/purchase', authenticate, validate(purchaseArticleSchema), ArticleController.purchaseArticle);
router.get('/:articleId/access', authenticate, ArticleController.getArticleAccess);
router.get('/:articleId/metadata', ArticleController.getArticleMetadata);
router.post('/:articleId/verify', authenticate, ArticleController.verifyArticleAccess);

export default router;