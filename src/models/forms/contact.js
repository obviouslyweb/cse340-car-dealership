import db from '../db.js';

/**
 * Inserts a new contact form submission into the database.
 * 
 * @param {string} subject - The subject of the contact message
 * @param {string} message - The message content
 * @returns {Promise<Object>} The newly created contact form record
 */
const createContactForm = async (subject, message) => {
    const query = `
        INSERT INTO contact_form (subject, message)
        VALUES ($1, $2)
        RETURNING *
    `;
    // "$1" and "$2" validates first and second user input to prevent SQL injection attacks!
    // NEVER concatenate user input into SQL queries, even if you think the input is safe
    const result = await db.query(query, [subject, message]);
    return result.rows[0];
};

/**
 * Retrieves all contact form submissions, ordered by most recent first.
 * 
 * @returns {Promise<Array>} Array of contact form records
 */
const getAllContactForms = async () => {
    const query = `
        SELECT id, subject, message, submitted
        FROM contact_form
        ORDER BY submitted DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

export { createContactForm, getAllContactForms };