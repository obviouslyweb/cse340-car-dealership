import db from './db.js';

/**
 * Fetches all vehicle categories
 */
const getCategories = async () => {
    const query = `
        SELECT id, name, description
        FROM categories
        ORDER BY id
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Categories with how many vehicles use each category
 */
const getCategoriesWithVehicleCounts = async () => {
    const query = `
        SELECT c.id, c.name, c.description, c.created_at,
               COUNT(v.id)::int AS vehicle_count
        FROM categories c
        LEFT JOIN vehicles v ON v.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Insert a new category
 */
const createCategory = async (name, description) => {
    const query = `
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        RETURNING id, name, description, created_at
    `;
    const desc = description && description.trim() ? description.trim() : null;
    const result = await db.query(query, [name.trim(), desc]);
    return result.rows[0] || null;
};

/**
 * Update category name and description
 */
const updateCategory = async (id, name, description) => {
    const query = `
        UPDATE categories
        SET name = $2,
            description = $3
        WHERE id = $1
        RETURNING id, name, description, created_at
    `;
    const desc = description && description.trim() ? description.trim() : null;
    const result = await db.query(query, [id, name.trim(), desc]);
    return result.rows[0] || null;
};

/**
 * Delete a category only if no vehicles reference it (ON DELETE RESTRICT)
 */
const deleteCategory = async (id) => {
    const countResult = await db.query(
        'SELECT COUNT(*)::int AS c FROM vehicles WHERE category_id = $1',
        [id]
    );
    const count = countResult.rows[0]?.c ?? 0;
    if (count > 0) {
        return { deleted: false, reason: 'in_use', vehicleCount: count };
    }
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    return { deleted: result.rowCount > 0, reason: null };
};

export {
    getCategories,
    getCategoriesWithVehicleCounts,
    createCategory,
    updateCategory,
    deleteCategory
};
