/* eslint-disable no-undef */

// "node server.js" for prod
// "pnpm run dev" for dev
// DON'T FORGET TO VERIFY ENV!

/*
Import express components
*/
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase, testConnection } from './src/models/setup.js';

/*
Import MVC components
*/
import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';
import { notFound, errorHandler } from './src/controllers/errors.js';


/*
Import session middleware
*/
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { caCert } from './src/models/db.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';
import flash from './src/middleware/flash.js';

/**
 * Server configuration
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
const isProduction = NODE_ENV === 'production';

/**
 * Setup Express Server
 */
const app = express();

// Render terminates HTTPS at the proxy, so Express must trust it for secure cookies.
if (isProduction) {
    app.set('trust proxy', 1);
}

// Initialize PostgreSQL session store
const pgSession = connectPgSimple(session);

// Configure session middleware
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL,
            // Configure SSL for session store connection (required by BYU-I databases)
            ssl: {
                ca: caCert,
                rejectUnauthorized: true,
                checkServerIdentity: () => { return undefined; }
            }
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Start automatic session cleanup
startSessionCleanup();

/**
 * Configure Express
 */
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Global Middleware
 */
// Global middleware (sets res.locals variables)
app.use(addLocalVariables);

// Flash message middleware (must come after session and global middleware)
app.use(flash);

// Allow Express to receive and process POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Use routes
 */
app.use('/', routes);

/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Start WebSocket Server in dev mode (used for live reload)
 */
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

/**
 * Start server & listen for database connection
 */
app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});