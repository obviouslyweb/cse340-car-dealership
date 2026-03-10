/* eslint-disable no-undef */

/**
 * Helper function to get the current greeting based on time.
 */
const getCurrentGreeting = () => {
    const now = new Date();
    const hour24 = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, '0');

    const timeHalf = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;

    let greeting;
    if (hour24 < 12) {
        greeting = 'Good morning';
    } else if (hour24 < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }

    return `${greeting}! It's currently ${hour12}:${minute} ${timeHalf}.`;
};


/**
 * Express middleware that adds head asset management functionality to routes.
 * Provides arrays for storing CSS and JS assets with priority support.
 * 
 * Adds these methods to the response object:
 * - res.addStyle(css, priority) - Add CSS/link tags to head
 * - res.addScript(js, priority) - Add script tags 
 * 
 * Adds these functions to EJS templates via res.locals:
 * - renderStyles() - Outputs all CSS in priority order (high to low)
 * - renderScripts() - Outputs all JS in priority order (high to low)
 */
const setHeadAssetsFunctionality = (res) => {
    res.locals.styles = [];
    res.locals.scripts = [];

    res.addStyle = (css, priority = 0) => {
        res.locals.styles.push({ content: css, priority });
    };

    res.addScript = (js, priority = 0) => {
        res.locals.scripts.push({ content: js, priority });
    };

    // These functions will be available in EJS templates
    res.locals.renderStyles = () => {
        return res.locals.styles
            // Sort by priority: higher numbers load first
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };

    res.locals.renderScripts = () => {
        return res.locals.scripts
            // Sort by priority: higher numbers load first
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };
};


/**
 * Middleware to add local variables to res.locals for use in all templates.
 * Templates can access these values but are not required to use them.
 */
const addLocalVariables = (req, res, next) => {
    // Set current year for use in templates
    res.locals.currentYear = new Date().getFullYear();

    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    // Make req.query available to all templates
    res.locals.queryParams = { ...req.query };

    // Set greeting based on time of day
    res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;

    // Randomly assign a theme class to the body
    const themes = ['blue-theme', 'green-theme', 'red-theme'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    res.locals.bodyClass = randomTheme;

    // Use setHeadAssetsFunctionality to determine priority of CSS & JS files depending on called view
    setHeadAssetsFunctionality(res);

    // Convenience variable for UI state based on session state
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    // Continue to the next middleware or route handler
    next();
};

export { addLocalVariables };