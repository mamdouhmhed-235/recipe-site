import { Request, Response, NextFunction } from 'express';
import { query, param, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input parameters',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : err.type,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for search endpoint
 */
export const validateSearch = [
  query('s')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules for meal ID parameter
 */
export const validateMealId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Meal ID is required')
    .isNumeric()
    .withMessage('Meal ID must be a number')
    .isLength({ min: 1, max: 10 })
    .withMessage('Meal ID must be between 1 and 10 digits'),
  handleValidationErrors
];

/**
 * Validation rules for filter by category endpoint
 */
export const validateFilterCategory = [
  query('c')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
    .escape(),
  handleValidationErrors
];
