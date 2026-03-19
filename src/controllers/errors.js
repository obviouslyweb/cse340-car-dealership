/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// 404 handler
function notFound(req, res, next) {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
}

// Global error handler (500)
function errorHandler(err, req, res, next) {
    // Prevent infinite loops, if a response has already been sent, do nothing
    if (res.headersSent || res.finished) {
        return next(err);
    }

    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // Ensure head-assets locals exist so the shared header partial
    // can safely call renderStyles()/renderScripts() on Render error pages
    if (!res.locals) {
        res.locals = {};
    }

    // Ensure base UI locals exist so shared header partial doesn't crash
    // even if `addLocalVariables` didn't run for this request.
    if (typeof res.locals.bodyClass === 'undefined') {
        const themes = ['blue-theme', 'green-theme', 'red-theme'];
        res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)];
    }
    if (typeof res.locals.isLoggedIn === 'undefined') res.locals.isLoggedIn = false;
    if (typeof res.locals.isEmployee === 'undefined') res.locals.isEmployee = false;
    if (typeof res.locals.isAdmin === 'undefined') res.locals.isAdmin = false;
    if (typeof res.locals.NODE_ENV === 'undefined') res.locals.NODE_ENV = NODE_ENV;

    if (req.session && req.session.user) {
        const roleName = (req.session.user.roleName || '').toLowerCase();
        res.locals.isLoggedIn = true;
        res.locals.isEmployee = roleName === 'employee' || roleName === 'admin';
        res.locals.isAdmin = roleName === 'admin';
    }

    if (typeof res.locals.renderStyles !== 'function') {
        res.locals.styles = [];
        res.locals.scripts = [];

        res.addStyle = (css, priority = 0) => {
            res.locals.styles.push({ content: css, priority });
        };

        res.addScript = (js, priority = 0) => {
            res.locals.scripts.push({ content: js, priority });
        };

        res.locals.renderStyles = () => {
            return res.locals.styles
                .sort((a, b) => b.priority - a.priority)
                .map((item) => item.content)
                .join('\n');
        };

        res.locals.renderScripts = () => {
            return res.locals.scripts
                .sort((a, b) => b.priority - a.priority)
                .map((item) => item.content)
                .join('\n');
        };
    }

    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV // Our WebSocket check needs this and its convenient to pass along
    };

    // Render the appropriate error template with fallback
    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        // If rendering fails, send a simple error page instead
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
    }
}

/*
Export errors for usage in server.js
*/
export { notFound, errorHandler };