import { validationResult } from 'express-validator';
import { findUser, verifyPassword } from '../../models/forms/login.js';
import { getReviewsByUserId } from '../../models/reviews.js';
import { getServiceRequestsByUserId, getServiceRequestById, updateServiceRequest } from '../../models/forms/service.js';
import { Router } from 'express';

const router = Router();

/**
 * Display the login form
 */
const showLoginForm = (req, res) => {
    return res.render('forms/login/form', {
        title: 'User Login'
    });
};

/**
 * Process login form submission
 */
const processLogin = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // ERRORS FOUND
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        res.redirect('/login');
        return;
    }

    // No errors found; proceed with login process
    // Extract identifier (username or email) and password from req.body
    const { email, password } = req.body;

    try {
        let user = await findUser(email);
        if (!user) {
            console.log(`User not found: ${user}`)
            req.flash('error', 'Invalid username/email or password.');
            return res.redirect('/login');
        }

        // Verify password
        let passwordVerified = await verifyPassword(password, user.password);
        if (!passwordVerified) {
            console.log("Invalid password");
            req.flash('error', 'Invalid username/email or password.');
            return res.redirect('/login');
        }

        // SECURITY: Remove password from user object before storing in session
        delete user.password;

        // Store user in session
        req.session.user = user;
        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/dashboard');

    } catch (error) {
        console.log(`Error encountered in login controller: ${error}`);
        req.flash('error', 'Something went wrong when trying to log you in. Please try again later.');
        return res.redirect('/login');
    }
};

/**
 * Handle user logout
 * NOTE: connect.sid is the default session cookie name since we did not specify a custom name when creating the session in server.js
 */
const processLogout = (req, res) => {
    // First, check if there is a session object on the request
    if (!req.session) {
        // If no session exists, there's nothing to destroy,
        // so we just redirect the user back to the home page
        req.flash('warning', "No user is logged in that can be logged out. What are you trying to do...?");
        return res.redirect('/');
    }

    // Call destroy() to remove this session from the store (PostgreSQL in our case)
    req.session.destroy((err) => {
        if (err) {
            // If something goes wrong while removing the session from the database:
            console.error('Error destroying session on logout:', err);

            /**
             * Clear the session cookie from the browser anyway, so the client
             * does not keep sending an invalid session ID.
             */
            res.clearCookie('connect.sid');

            /** 
             * Normally we would respond with a 500 error since logout did not fully succeed.
             * Example: return res.status(500).send('Error logging out');
             * 
             * Since this is a practice site, we will redirect to the home page anyway.
             */
            return res.redirect('/');
        }

        // If session destruction succeeded, clear the session cookie from the browser
        res.clearCookie('connect.sid');

        // Redirect the user to the home page
        res.redirect('/');
    });
};

/**
 * Display protected dashboard (requires login)
 */
const showDashboard = async (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    // Security check! Ensure user and sessionData do not contain password field
    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
    }
    if (sessionData.user && sessionData.user.password) {
        console.error('Security error: password found in sessionData.user');
        delete sessionData.user.password;
    }

    let myReviews = [];
    let myServiceRequests = [];
    if (user && user.id) {
        try {
            myReviews = await getReviewsByUserId(user.id) || [];
        } catch (err) {
            console.error('Error loading user reviews for dashboard:', err);
        }
        try {
            myServiceRequests = await getServiceRequestsByUserId(user.id) || [];
        } catch (err) {
            console.error('Error loading service requests for dashboard:', err);
        }
    }

    res.render('dashboard', {
        title: 'Dashboard',
        user,
        sessionData,
        myReviews,
        myServiceRequests
    });
};

/**
 * Edit the current user's own service request
 * POST /dashboard/service-requests/:id/edit
 */
const handleEditMyServiceRequest = async (req, res, next) => {
    const requestId = parseInt(req.params.id, 10);
    if (Number.isNaN(requestId)) {
        return next();
    }
    const userId = req.session?.user?.id;
    if (!userId) {
        req.flash('error', 'You must be logged in to edit a service request.');
        return res.redirect('/login');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((err) => req.flash('error', err.msg));
        return res.redirect('/dashboard');
    }

    try {
        const reqRow = await getServiceRequestById(requestId);
        if (!reqRow) {
            req.flash('error', 'Service request not found or already updated.');
            return res.redirect('/dashboard');
        }
        if (reqRow.user_id !== userId) {
            req.flash('error', 'You can only edit your own service requests.');
            return res.redirect('/dashboard');
        }

        const { service_type, vehicle_name, description } = req.body;
        await updateServiceRequest(requestId, service_type, vehicle_name, description || null);
        req.flash('success', 'Your service request has been updated.');
    } catch (err) {
        console.error('Error updating service request:', err);
        req.flash('error', 'Unable to update your service request. Please try again later.');
    }
    return res.redirect('/dashboard');
};

// Routes
router.get('/', showLoginForm);
router.post('/', processLogin);
// router.post('/', loginValidation, processLogin);

// Export router as default, and specific functions for root-level routes
export default router;
export { processLogout, showDashboard, handleEditMyServiceRequest };