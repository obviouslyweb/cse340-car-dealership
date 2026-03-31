/*
Add import statements for controllers and middleware
*/

// Router core
import { Router } from 'express';

// Middleware import
import { contactValidation, reviewValidation, serviceRequestValidation, vehicleEditValidation } from '../middleware/validation/forms.js';

// // Controllers (for page routing)
import { homePage, aboutPage } from './index.js';
import { vehicleListPage, vehicleDetailPage, handleReviewSubmission, handleVehicleDelete } from './vehicles.js';
import contactRoutes from './forms/contact.js';
import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard, handleEditMyServiceRequest } from './forms/login.js';
import { handleDeleteMyReview, handleEditMyReview } from './forms/dashboard_reviews.js';
import { requireLogin, requireRole } from '../middleware/auth.js';
import moderationReviewsRoutes from './moderation/reviews.js';
import moderationContactRoutes from './moderation/contact.js';
import moderationServiceRoutes from './moderation/service.js';
import moderationUsersRoutes from './moderation/users.js';
import addVehicleRoutes from './moderation/add_vehicle.js';
import moderationCategoriesRoutes from './moderation/categories.js';
import moderationActivityLogRoutes from './moderation/activity_log.js';
import { handleVehicleEdit } from './moderation/edit_vehicle.js';
import serviceRoutes from './forms/service.js';

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

// Form styles for service request
router.use('/service-request', (req, res, next) => {
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
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    res.addStyle('<link rel="stylesheet" href="/css/moderation.css">');
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
router.post('/vehicles/:id/edit', requireLogin, requireRole(['employee', 'admin']), vehicleEditValidation, handleVehicleEdit);
router.post('/vehicles/:id/delete', requireLogin, requireRole('admin'), handleVehicleDelete);
router.get('/vehicles/:id', vehicleDetailPage);

// Contact form routes
router.use('/contact', contactValidation, contactRoutes);

// Registration routes
router.use('/register', registrationRoutes);

// Login routes (form and submission)
router.use('/login', loginRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

// Service request (requires login)
router.use('/service-request', requireLogin, serviceRoutes);
router.post('/dashboard/reviews/:id/delete', requireLogin, handleDeleteMyReview);
router.post('/dashboard/reviews/:id/edit', requireLogin, reviewValidation, handleEditMyReview);
router.post('/dashboard/service-requests/:id/edit', requireLogin, serviceRequestValidation, handleEditMyServiceRequest);

// Moderation (employees and admins only)
router.use('/moderation/contact', requireLogin, requireRole(['employee', 'admin']), moderationContactRoutes);
router.use('/moderation/reviews', requireLogin, requireRole(['employee', 'admin']), moderationReviewsRoutes);
router.use('/moderation/service', requireLogin, requireRole(['employee', 'admin']), moderationServiceRoutes);
// Admin only routes
router.use('/moderation/users', requireLogin, requireRole('admin'), moderationUsersRoutes);
router.use('/moderation/add_vehicle', requireLogin, requireRole('admin'), addVehicleRoutes);
router.use('/moderation/categories', requireLogin, requireRole('admin'), moderationCategoriesRoutes);
router.use('/moderation/activity-log', requireLogin, requireRole('admin'), moderationActivityLogRoutes);

/*
Export router for usage in server.js
*/
export default router;