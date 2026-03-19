import db from '../db.js';

/**
 * Inserts a new contact form submission into the database
 */
const createContactForm = async (subject, message) => {
    const query = `
        INSERT INTO contact_form (subject, message)
        VALUES ($1, $2)
        RETURNING *
    `;
    const result = await db.query(query, [subject, message]);
    return result.rows[0];
};

/**
 * Retrieves all contact form submissions, ordered by most recent first
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

/**
 * Deletes a contact form submission by id
 */
const deleteContactForm = async (id) => {
    const query = `DELETE FROM contact_form WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

export { createContactForm, getAllContactForms, deleteContactForm };