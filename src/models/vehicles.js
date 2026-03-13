import db from './db.js';

/**
 * Fetches all featured vehicles with their primary image URL
 */
const getFeaturedVehicles = async () => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
               v.stock,
               vi.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.is_featured = TRUE AND v.stock > 0
        ORDER BY v.id
    `;
    const result = await db.query(query);
    return result.rows;
};

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
 * Fetches vehicles with their primary image URL
 * Filters:
 * - categoryId: Optional category ID to filter by
 * - includeUnavailable: If true, include vehicles with no remaining stock
 */
const getVehicles = async ({ categoryId, includeUnavailable = false } = {}) => {
    const conditions = [];
    const params = [];

    if (!includeUnavailable) {
        conditions.push('v.stock > 0');
    }
    if (categoryId) {
        params.push(categoryId);
        conditions.push(`v.category_id = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT v.id, v.category_id, v.make, v.model, v.year, v.price, v.mileage,
               v.description, v.stock,
               vi.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        ${whereClause}
        ORDER BY v.id
    `;

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Fetches a single vehicle by ID with its primary image URL
 */
const getVehicleById = async (id) => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
               v.category_id, v.stock,
               vi.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

export { getFeaturedVehicles, getVehicles, getVehicleById, getCategories };
