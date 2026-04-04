import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      res.status(400).json({
        error: 'Validation error',
        details: errors
      });
      return;
    }
    
    next();
  };
};

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const purchaseArticleSchema = Joi.object({
  articleId: Joi.string().required(),
  publisherId: Joi.string().required(),
  amount: Joi.number().min(0.25).max(10).required()
});

export const addFundsSchema = Joi.object({
  amount: Joi.number().min(5).max(500).required()
  // Removed paymentMethodId - not needed for demo
});

export const addPaymentMethodSchema = Joi.object({
  cardNumber: Joi.string().creditCard().required(),
  expiryMonth: Joi.number().min(1).max(12).required(),
  expiryYear: Joi.number().min(new Date().getFullYear()).required(),
  cvv: Joi.string().length(3).required(),
  cardholderName: Joi.string().required()
});
