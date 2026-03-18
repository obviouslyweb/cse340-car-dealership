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

/**
 * Gets all reviews for a vehicle from vehicle ID
 */
const getReviewsByVehicleId = async (id) => {
    const query = `
        SELECT r.id, r.vehicle_id, r.user_id, r.rating, r.body, r.is_visible, r.created_at, r.updated_at
        FROM reviews r
        WHERE r.vehicle_id = $1 AND r.is_visible = TRUE
        ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
};

/**
 * Gets reviews that need to be moderated
 */
const getReviewsAwaitingApproval = async (id) => {
    const query = `
        SELECT r.id, r.vehicle_id, r.user_id, r.rating, r.body, r.is_visible, r.created_at, r.updated_at
        FROM reviews r
        WHERE r.is_visible = FALSE
        ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
};

/**
 * Gets number of stars for aggregate review data
 */
const getAggregateReviewScoreByVehicleId = async (id) => {
    const query = `
        SELECT AVG(r.rating) AS average_rating, COUNT(*) AS review_count
        FROM reviews r
        WHERE r.vehicle_id = $1 AND r.is_visible = TRUE
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

export { getFeaturedVehicles, getVehicles, getVehicleById, getCategories, getReviewsByVehicleId, getReviewsAwaitingApproval, getAggregateReviewScoreByVehicleId };
