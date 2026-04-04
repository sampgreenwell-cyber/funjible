import express from 'express';
import { ArticleController } from '../controllers/articleController';
import { authenticate } from '../middleware/auth';
import { validate, purchaseArticleSchema } from '../middleware/validation';

const router = express.Router();

// Get purchased articles - MUST BE BEFORE /:id
router.get('/purchased', authenticate, ArticleController.getPurchasedArticles);

// Browse articles
router.get('/', ArticleController.getArticles);

// Get single article
router.get('/:id', ArticleController.getArticle);

// Purchase article
router.post('/:id/purchase', authenticate, ArticleController.purchaseArticle);

// Legacy routes
router.post('/purchase', authenticate, validate(purchaseArticleSchema), ArticleController.purchaseArticle);
router.get('/:articleId/access', authenticate, ArticleController.getArticleAccess);
router.get('/:articleId/metadata', ArticleController.getArticleMetadata);
router.post('/:articleId/verify', authenticate, ArticleController.verifyArticleAccess);

export default router;