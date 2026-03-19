/**
 * Middleware to require authentication for protected routes
 * Redirects to login page if user is not authenticated
 * Sets res.locals.isLoggedIn = true for authenticated requests
 */
const requireLogin = (req, res, next) => {
    // Check if user is logged in via session; we can beef this up later with roles and permissions
    if (req.session && req.session.user) {
        // User is authenticated - set UI state and continue
        res.locals.isLoggedIn = true;
        next();
    } else {
        // User is not authenticated - redirect to login
        req.flash('error', 'You must be logged in to access this page.');
        res.redirect('/login');
    }
};

/**
 * Middleware factory to require specific role(s) for route access
 * Returns middleware that checks if user has one of the required roles
 */
const requireRole = (roleOrRoles) => {
    const allowed = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return (req, res, next) => {
        // Check if user is logged in first
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        const userRole = (req.session.user.roleName || '').toLowerCase();
        const hasRole = allowed.some((r) => r.toLowerCase() === userRole);

        if (!hasRole) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        next();
    };
};

export { requireLogin, requireRole };