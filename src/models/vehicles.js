import db from './db.js';

/**
 * Fetches all featured vehicles with their primary image URL
 */
const getFeaturedVehicles = async () => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description, v.stock, vi.image_url, ROUND(AVG(r.rating)::numeric, 1) AS average_rating
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        LEFT JOIN reviews r ON r.vehicle_id = v.id AND r.is_visible = TRUE
        WHERE v.is_featured = TRUE AND v.stock > 0
        GROUP BY v.id, vi.image_url
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
               vi.image_url,
               ROUND(AVG(r.rating)::numeric, 1) AS average_rating
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        LEFT JOIN reviews r ON r.vehicle_id = v.id AND r.is_visible = TRUE
        ${whereClause}
        GROUP BY v.id, vi.image_url
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
 * Fetches all images for a vehicle (primary first, then by id)
 */
const getVehicleImages = async (vehicleId) => {
    const query = `
        SELECT id, image_url, is_primary
        FROM vehicle_images
        WHERE vehicle_id = $1
        ORDER BY is_primary DESC, id
    `;
    const result = await db.query(query, [vehicleId]);
    return result.rows;
};

/**
 * Gets a single review by id (for ownership checks).
 */
const getReviewById = async (id) => {
    const query = `
        SELECT id, vehicle_id, user_id, rating, body, is_visible, created_at
        FROM reviews
        WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Gets all reviews submitted by a user
 */
const getReviewsByUserId = async (userId) => {
    const query = `
        SELECT r.id, r.vehicle_id, r.rating, r.body, r.is_visible, r.created_at,
               v.year AS vehicle_year, v.make AS vehicle_make, v.model AS vehicle_model
        FROM reviews r
        INNER JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Gets all reviews for a vehicle from vehicle ID
 */
const getReviewsByVehicleId = async (id) => {
    const query = `
        SELECT r.id, r.vehicle_id, r.user_id, r.rating, r.body, r.is_visible, r.created_at, r.updated_at, u.name AS user_name
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.id
        WHERE r.vehicle_id = $1 AND r.is_visible = TRUE
        ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
};

/**
 * Gets all reviews that need to be moderated (is_visible = FALSE), with user and vehicle info.
 */
const getReviewsAwaitingApproval = async () => {
    const query = `
        SELECT r.id, r.vehicle_id, r.user_id, r.rating, r.body, r.created_at,
               u.name AS user_name,
               v.year AS vehicle_year, v.make AS vehicle_make, v.model AS vehicle_model
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.id
        INNER JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.is_visible = FALSE
        ORDER BY r.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Marks a review as visible (approved)
 */
const approveReview = async (id) => {
    const query = `
        UPDATE reviews SET is_visible = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, vehicle_id, is_visible
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Deletes a review from the database (rejected)
 */
const deleteReview = async (id) => {
    const query = `DELETE FROM reviews WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Updates a review's rating and body
 * sets is_visible to False so it can be moderated again
 */
const updateReview = async (id, rating, body) => {
    const query = `
        UPDATE reviews
        SET rating = $2, body = $3, is_visible = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, vehicle_id, user_id, rating, body, is_visible, updated_at
    `;
    const result = await db.query(query, [id, rating, body.trim()]);
    return result.rows[0] || null;
};

/**
 * Creates a new review for a vehicle from form
 */
const createReview = async (vehicleId, userId, rating, body) => {
    const query = `
        INSERT INTO reviews (vehicle_id, user_id, rating, body, is_visible)
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING id, vehicle_id, user_id, rating, body, is_visible, created_at
    `;
    const result = await db.query(query, [vehicleId, userId, rating, body]);
    return result.rows[0];
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

export { getFeaturedVehicles, getVehicles, getVehicleById, getVehicleImages, getCategories, getReviewById, getReviewsByUserId, getReviewsByVehicleId, getReviewsAwaitingApproval, getAggregateReviewScoreByVehicleId, createReview, approveReview, deleteReview, updateReview };
