/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// REMEMBER: Errors come after routing
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