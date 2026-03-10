/*
Add import statements for controllers and middleware
*/
// Router core
import { Router } from 'express';

// ---------------------- TODO ----------------------
// Middleware import
// import { addDemoHeaders } from '../middleware/demo/headers.js';
import { contactValidation, registrationValidation, loginValidation, updateAccountValidation } from '../middleware/validation/forms.js';

// ---------------------- TODO ----------------------
// // Controllers (for page routing)
// import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage } from './index.js';
// import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
// import contactRoutes from './forms/contact.js';
// import registrationRoutes from './forms/registration.js';
// import loginRoutes from './forms/login.js';
// import { processLogout, showDashboard } from './forms/login.js';
// import { requireLogin } from '../middleware/auth.js';

// Create a new router instance
const router = Router();

// ---------------------- TODO ----------------------
/*
Router Middleware
*/
// // Add catalog-specific CSS styles to all catalog routes
// router.use('/catalog', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
//     next();
// });

// // Add catalog-specific CSS styles to all faculty routes
// router.use('/faculty', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
//     next();
// });

// // Add contact-specific styles to all contact routes
// router.use('/contact', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
//     next();
// });

// // Add registration-specific styles to all registration routes
// router.use('/register', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
//     next();
// });

// // Add login-specific styles to all login routes
// router.use('/login', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/login.css">');
//     next();
// });

/*
Add route definitions
*/
// Home and basic pages
router.get('/', homePage);
// router.get('/about', aboutPage);

// ---------------------- TODO ----------------------
// // Course catalog routes
// router.get('/catalog', catalogPage);
// router.get('/catalog/:slugId', courseDetailPage);

// ---------------------- TODO ----------------------
// // Faculty routes
// router.get('/faculty', facultyListPage);
// router.get('/faculty/:facultySlug', facultyDetailPage);

// // Contact form routes
router.use('/contact', contactValidation, contactRoutes);

// ---------------------- TODO ----------------------
// // Registration routes
// router.use('/register', registrationValidation, updateAccountValidation, registrationRoutes);

// ---------------------- TODO ----------------------
// // Login routes (form and submission)
// router.use('/login', loginValidation, loginRoutes);

// ---------------------- TODO ----------------------
// // Authentication-related routes at root level
// router.get('/logout', processLogout);
// router.get('/dashboard', requireLogin, showDashboard);

// ---------------------- TODO ----------------------
// Route to trigger a test error
router.get('/test-error', testErrorPage);

/*
Export router for usage in server.js
*/
export default router;