import db from './db.js';

/**
 * Gets a single review by id
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
        SELECT r.id, r.vehicle_id, r.rating, r.body, r.is_visible, r.created_at, v.year AS vehicle_year, v.make AS vehicle_make, v.model AS vehicle_model
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
 * Gets all reviews that need to be moderated (is_visible = FALSE)
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
 * Marks a review as visible
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
 * Deletes a review from the database
 */
const deleteReview = async (id) => {
    const query = `DELETE FROM reviews WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Updates a review's rating and body
 * sets is_visible to false so it can be reviewed
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

export {
    getReviewById,
    getReviewsByUserId,
    getReviewsByVehicleId,
    getReviewsAwaitingApproval,
    approveReview,
    deleteReview,
    updateReview,
    createReview,
    getAggregateReviewScoreByVehicleId
};
