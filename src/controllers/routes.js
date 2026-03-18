/*
Add import statements for controllers and middleware
*/
// Router core
import { Router } from 'express';

// ---------------------- TODO ----------------------
// Middleware import
import { contactValidation, registrationValidation, loginValidation, updateAccountValidation, reviewValidation } from '../middleware/validation/forms.js';

// ---------------------- TODO ----------------------
// // Controllers (for page routing)
// import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, vehicleListPage, vehicleDetailPage, handleReviewSubmission } from './index.js';
// import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
import contactRoutes from './forms/contact.js';
import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard, handleDeleteMyReview, handleEditMyReview } from './forms/login.js';
import { requireLogin, requireRole } from '../middleware/auth.js';
import moderationReviewsRoutes from './moderation/reviews.js';
import moderationContactRoutes from './moderation/contact.js';

// Create a new router instance
const router = Router();

/*
Router Middleware
*/

// Add hero styles to home page
router.use((req, res, next) => {
    if (req.path === "/") {
        res.addStyle('<link rel="stylesheet" href="/css/home.css">');
    }
    next();
});

// Add vehicle-specific styles to home and vehicle pages (list + detail)
router.use((req, res, next) => {
    if (req.path === '/' || req.path.startsWith('/vehicles')) {
        res.addStyle('<link rel="stylesheet" href="/css/vehicle.css">');
    }
    next();
});

// Form styles for vehicle detail (review form)
router.use('/vehicles', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    next();
});

// Add contact-specific styles to all contact routes
router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    next();
});

// Add registration-specific styles to all registration routes
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    res.addStyle('<link rel="stylesheet" href="/css/users.css">');
    next();
});

// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    next();
});

// Add dashboard-specific styles to dashboard and moderation routes
router.use('/dashboard', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/dashboard.css">');
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    next();
});
router.use('/moderation', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/dashboard.css">');
    next();
});

/*
Route definitions
*/
// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Vehicle list and detail (exact /vehicles before :id)
router.get('/vehicles', vehicleListPage);
router.post('/vehicles/:id/review', requireLogin, reviewValidation, handleReviewSubmission);
router.get('/vehicles/:id', vehicleDetailPage);

// Contact form routes
router.use('/contact', contactValidation, contactRoutes);

// Registration routes
router.use('/register', registrationValidation, updateAccountValidation, registrationRoutes);

// Login routes (form and submission)
router.use('/login', loginValidation, loginRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);
router.post('/dashboard/reviews/:id/delete', requireLogin, handleDeleteMyReview);
router.post('/dashboard/reviews/:id/edit', requireLogin, reviewValidation, handleEditMyReview);

// Moderation (employees and admins only)
router.use('/moderation/contact', requireLogin, requireRole(['employee', 'admin']), moderationContactRoutes);
router.use('/moderation/reviews', requireLogin, requireRole(['employee', 'admin']), moderationReviewsRoutes);

/*
Export router for usage in server.js
*/
export default router;