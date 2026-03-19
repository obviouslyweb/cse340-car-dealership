import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Find a user by email address for login verification
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT 
            users.id, 
            users.name, 
            users.email, 
            users.password, 
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE LOWER(users.email) = LOWER($1)
        LIMIT 1
    `;
    // ($1) used to escape email
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Find a user by email or username (users.name)
 */
const findUser = async (identifier) => {
    const query = `
        SELECT 
            users.id, users.name, users.email, users.password, users.created_at,roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE LOWER(users.email) = LOWER($1)
           OR LOWER(users.name) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [identifier]);
    return result.rows[0] || null;
};

/**
 * Verify a plain text password against a stored bcrypt hash
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    let result = await bcrypt.compare(plainPassword, hashedPassword);
    return result;
};

export { findUserByEmail, findUser, verifyPassword };