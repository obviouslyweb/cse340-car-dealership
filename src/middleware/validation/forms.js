import { body } from 'express-validator';

/**
 * Validation rules for contact form
 */
const contactValidation = [
    body('subject')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Subject must be between 2 and 255 characters')
        .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
        .withMessage('Subject contains invalid characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters')
        .custom((value) => {
            // Check for spam patterns (excessive repetition)
            const words = value.split(/\s+/);
            const uniqueWords = new Set(words);
            if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                throw new Error('Message appears to be spam');
            }
            return true;
        })
]

/**
 * Validation rules for editing user accounts
 */
const updateAccountValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long')
];

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long; please use a shorter email address.'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
        .withMessage('Password must contain at least one special character')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Validation rules for vehicle review form
 */
const reviewValidation = [
    body('rating')
        .toInt()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('body')
        .trim()
        .notEmpty()
        .withMessage('Review text is required')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Review must be between 10 and 2000 characters')
];

/**
 * Validation rules for login form
 */
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .isLength({ min: 2, max: 255 })
        .withMessage('Please enter your username or email')
        .custom((value) => {
            // check if this is likely an email
            const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (validEmail) return true;
            // check if username is valid
            return /^[a-zA-Z0-9\s'-]+$/.test(value);
        })
        .withMessage('Please enter a valid username or email address'),
    body('password')
        .notEmpty()
        .withMessage('Password must not be empty')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
];

/**
 * Validation rules for service request form
 */
const serviceRequestValidation = [
    body('service_type')
        .trim()
        .notEmpty()
        .withMessage('Please select a service type')
        .isIn([
            'Oil Change',
            'Tire Rotation',
            'Brake Service',
            'Battery Replacement',
            'Filter Replacement',
            'Multi-Point Inspection',
            'Fluid Flush',
            'Alignment',
            'Other'
        ])
        .withMessage('Invalid service type'),
    body('vehicle_name')
        .trim()
        .notEmpty()
        .withMessage('Vehicle name is required')
        .isLength({ max: 50 })
        .withMessage('Vehicle name must be 50 characters or less'),
    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description must be 2000 characters or less')
];

/**
 * Validation for staff editing service request (status, employee_notes, status_facing_user)
 */
const serviceRequestModerationValidation = [
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['Submitted', 'In Progress', 'Completed'])
        .withMessage('Invalid status'),
    body('employee_notes')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Employee notes must be 2000 characters or less'),
    body('status_facing_user')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 })
        .withMessage('User-facing status must be 2000 characters or less')
];

/**
 * Validation rules for employee/admin vehicle editing
 */
const vehicleEditValidation = [
    body('category_id')
        .toInt()
        .isInt({ min: 1 })
        .withMessage('Please select a valid category'),
    body('make')
        .trim()
        .notEmpty()
        .withMessage('Make is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Make must be between 1 and 100 characters'),
    body('model')
        .trim()
        .notEmpty()
        .withMessage('Model is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Model must be between 1 and 100 characters'),
    body('year')
        .toInt()
        .isInt({ min: 1886, max: 2100 })
        .withMessage('Year must be between 1886 and 2100'),
    body('price')
        .toFloat()
        .isFloat({ min: 0 })
        .withMessage('Price must be a valid non-negative amount'),
    body('mileage')
        .optional({ values: 'falsy' })
        .toInt()
        .isInt({ min: 0 })
        .withMessage('Mileage must be a non-negative whole number'),
    body('stock')
        .toInt()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative whole number'),
    body('is_featured')
        .optional({ values: 'falsy' })
        .isIn(['true'])
        .withMessage('Featured flag is invalid'),
    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description must be 2000 characters or less')
];

/**
 * Validation for admin moderation updates:
 * - rename a user
 * - change permission level (role)
 */
const moderationUserUpdateValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('roleName')
        .trim()
        .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value))
        .isIn(['user', 'employee', 'admin'])
        .withMessage('Invalid permission level')
];

export { contactValidation, registrationValidation, loginValidation, updateAccountValidation, reviewValidation, serviceRequestValidation, serviceRequestModerationValidation, vehicleEditValidation, moderationUserUpdateValidation };